'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { MultiSelect } from '@/components/ui/combomultiple'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { Ellipsis, SearchIcon, X } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { useForm } from 'react-hook-form'
import type { MailSearchFieldScope } from '../mails-types'
import { clearMailSearch, setMailSearch } from '../store/mail-search-slice'
import { useGetFoldersQuery } from '../store/mails-api'
import { folderPathFromParams } from '../utils/folder-path-from-params'
import { normalizeFolderType } from '../utils/folder-type-helpers'
import {
  ADVANCED_QUERY_TOKEN_RE,
  buildMailSearchParams,
  defaultSearchFormValues,
  isSimpleBarCompatible,
  mailSearchParamsToFormValues,
  mailSearchParamsToQueryText,
  queryTextToSearchFormValues,
  searchFormSchema,
  SEARCH_FIELD_SCOPE_TARGET,
  type SearchFormValues,
  type SimpleSearchField,
} from '../utils/mail-search-form'
import SearchFolders, { flattenFolders } from './search-folders'
import SearchMoreOptions from './search-more-options'

// Order in which the simple-search box picks the field it displays/reads
// from when several scopes are selected at once.
const READ_PRIORITY: SimpleSearchField[] = ['subject', 'from', 'to', 'text']

export function MailsSearch() {
  const formT = useTranslations('FORM_COMMONS')
  const t = useTranslations('MAILS_COMMONS')
  const dispatch = useAppDispatch()
  const { account, folder } = useParams()
  const accountId = Array.isArray(account) ? (account[0] ?? '0') : (account ?? '0')
  const currentFolderPath = folderPathFromParams(
    folder as string | string[] | undefined
  )

  const mailSearch = useAppSelector((state) => state.mailSearch)
  const isSearchActiveForAccount =
    mailSearch.isActive && mailSearch.accountId === accountId

  const [advancedOpen, setAdvancedOpen] = useState(false)
  // The top bar switches from the simple (field-scope-driven) input to a
  // Gmail-style "key:value" query bar whenever the active search can't be
  // expressed by the simple bar — either because it was launched from the
  // advanced modal, or because the user typed a recognized operator (e.g.
  // "to:") directly into the simple bar.
  const [barMode, setBarMode] = useState<'simple' | 'advanced'>('simple')
  const [advancedQueryText, setAdvancedQueryText] = useState('')
  const simplePrefilledRef = useRef(false)
  const advancedPrefilledRef = useRef(false)

  // The simple search bar and the advanced search modal are deliberately
  // decoupled: each owns its own form and can set the active mail search on
  // its own, without needing the other to be opened or filled in first.
  const simpleForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: defaultSearchFormValues,
  })
  const advancedForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: defaultSearchFormValues,
  })

  useEffect(() => {
    if (isSearchActiveForAccount && !simplePrefilledRef.current) {
      const params = mailSearch.params ?? {}
      if (isSimpleBarCompatible(params)) {
        setBarMode('simple')
        simpleForm.reset(mailSearchParamsToFormValues(params))
      } else {
        setBarMode('advanced')
        setAdvancedQueryText(mailSearchParamsToQueryText(params))
      }
      simplePrefilledRef.current = true
    }
  }, [isSearchActiveForAccount, mailSearch.params, simpleForm])

  useEffect(() => {
    if (advancedOpen && isSearchActiveForAccount && !advancedPrefilledRef.current) {
      const params = mailSearch.params ?? {}
      // Only reflect the active search here when it actually requires the
      // advanced form to express (bcc, attachments, dates, labels, etc.) —
      // a search that came from the simple bar (e.g. typing "tutu" writes it
      // to subject/from under the hood) must stay local to the simple bar
      // and not leak into the advanced modal's fields.
      if (!isSimpleBarCompatible(params)) {
        advancedForm.reset(mailSearchParamsToFormValues(params))
      }
      advancedPrefilledRef.current = true
    }
  }, [advancedOpen, isSearchActiveForAccount, mailSearch.params, advancedForm])

  useEffect(() => {
    if (!isSearchActiveForAccount) {
      // The search can also be cleared from outside this component (e.g.
      // useFolderMessages clearing it on folder navigation) — reset the
      // forms here too so the bar's query/scope don't linger stale.
      simpleForm.reset(defaultSearchFormValues)
      advancedForm.reset(defaultSearchFormValues)
      simplePrefilledRef.current = false
      advancedPrefilledRef.current = false
      setBarMode('simple')
      setAdvancedQueryText('')
    }
  }, [isSearchActiveForAccount, simpleForm, advancedForm, mailSearch.isActive, mailSearch.accountId, accountId])

  const { data: folders } = useGetFoldersQuery({ accountId })
  const flatFolders = useMemo(
    () => flattenFolders(Array.isArray(folders) ? folders : folders ? [folders] : []),
    [folders]
  )
  const inboxPath = flatFolders.find((f) => normalizeFolderType(f.type) === 'INBOX')?.path
  const draftsPath = flatFolders.find((f) => normalizeFolderType(f.type) === 'DRAFT')?.path
  const sentPath = flatFolders.find((f) => normalizeFolderType(f.type) === 'SENT')?.path

  const fieldScopeOptions: { value: MailSearchFieldScope; label: string }[] = [
    { value: 'subject', label: t('subject.string') },
    { value: 'sender', label: t('search.scope.sender.string') },
    { value: 'to', label: t('search.to_or_cc.string') },
    { value: 'entire_message', label: t('search.scope.entire_message.string') },
  ]

  const fieldScope = simpleForm.watch('fieldScope')
  const activeTargets = useMemo(
    () =>
      Array.from(new Set(fieldScope.map((scope) => SEARCH_FIELD_SCOPE_TARGET[scope]))),
    [fieldScope]
  )
  const readField =
    READ_PRIORITY.find((field) => activeTargets.includes(field)) ?? 'text'
  const activeValue = simpleForm.watch(readField)

  const setSimpleSearchField = (field: SimpleSearchField, value: string) => {
    simpleForm.setValue(field, value, { shouldDirty: true })
  }

  const handleActiveValueChange = (value: string) => {
    activeTargets.forEach((field) => setSimpleSearchField(field, value))
  }

  // Typing a recognized "key:value" operator into the simple bar (e.g.
  // "to:") switches it into the advanced query bar, carrying over what was
  // already typed instead of discarding it.
  const handleQueryInputChange = (value: string) => {
    if (barMode === 'advanced') {
      setAdvancedQueryText(value)
      return
    }
    if (ADVANCED_QUERY_TOKEN_RE.test(value)) {
      setBarMode('advanced')
      setAdvancedQueryText(value)
      return
    }
    handleActiveValueChange(value)
  }

  // Selecting/unselecting a scope moves the typed value to the newly
  // targeted field(s) instead of losing it — e.g. adding "Sender" to
  // "Subject" carries the text over into `from` too, so the API (which ORs
  // the fields together) stays in sync. At least one scope must stay
  // selected.
  const handleFieldScopeChange = (newScopes: string[]) => {
    if (newScopes.length === 0) return
    const scopes = newScopes as MailSearchFieldScope[]
    const previousTargets = activeTargets
    const newTargets = Array.from(
      new Set(scopes.map((scope) => SEARCH_FIELD_SCOPE_TARGET[scope]))
    )
    const currentValue = activeValue

    previousTargets
      .filter((field) => !newTargets.includes(field))
      .forEach((field) => setSimpleSearchField(field, ''))

    if (currentValue) {
      newTargets
        .filter((field) => !previousTargets.includes(field))
        .forEach((field) => setSimpleSearchField(field, currentValue))
    }

    simpleForm.setValue('fieldScope', scopes, { shouldDirty: true })
  }

  const handleSimpleSubmit = (values: SearchFormValues) => {
    // The simple bar can write the query into several fields at once (one
    // per selected scope) — they must be ORed together so a match on any of
    // them is enough, unlike the advanced modal's default AND semantics. It
    // also always searches the folder currently open in the mail list,
    // unlike the advanced modal which lets the user pick any folder/scope.
    dispatch(
      setMailSearch({
        accountId,
        params: buildMailSearchParams({
          ...values,
          operator: 'OR',
          folder: currentFolderPath || 'all',
        }),
        folder: currentFolderPath,
      })
    )
  }

  // Applies the advanced bar's typed query text as the active search. Fields
  // the bar doesn't expose (currently just the folder scope) fall back to
  // whatever the active search already has, so editing the bar in place
  // doesn't silently widen/narrow the folder scope.
  const submitAdvancedQueryText = () => {
    const baseFolder = mailSearch.params?.folders?.[0] ?? (currentFolderPath || 'all')
    const values = queryTextToSearchFormValues(advancedQueryText, {
      ...defaultSearchFormValues,
      folder: baseFolder,
    })
    const params = buildMailSearchParams(values)
    simplePrefilledRef.current = true
    setAdvancedQueryText(mailSearchParamsToQueryText(params))
    dispatch(
      setMailSearch({
        accountId,
        params,
        folder: currentFolderPath,
      })
    )
  }

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (barMode === 'advanced') {
        submitAdvancedQueryText()
      } else {
        simpleForm.handleSubmit(handleSimpleSubmit)()
      }
    }
  }

  const handleAdvancedSubmit = (values: SearchFormValues) => {
    const params = buildMailSearchParams(values)
    simplePrefilledRef.current = true
    setBarMode('advanced')
    setAdvancedQueryText(mailSearchParamsToQueryText(params))
    dispatch(
      setMailSearch({
        accountId,
        params,
        folder: currentFolderPath,
      })
    )
    setAdvancedOpen(false)
  }

  const clearSearch = () => {
    simpleForm.reset(defaultSearchFormValues)
    advancedForm.reset(defaultSearchFormValues)
    dispatch(clearMailSearch())
    simplePrefilledRef.current = false
    advancedPrefilledRef.current = false
    setBarMode('simple')
    setAdvancedQueryText('')
  }

  const handleClearButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    clearSearch()
  }

  return (
    <>
      <Form {...simpleForm}>
        {/* The app header sets an accent (violet) foreground color for its
            children; override it here so the search bar's text/icons render
            in the normal foreground color instead. */}
        <div className="text-foreground flex items-center gap-2">
          {barMode === 'advanced' && (
            <Badge variant="secondary" className="shrink-0">
              {t('search.advanced_bar_label.string')}
            </Badge>
          )}
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500 opacity-70" />
            <Input
              className="pr-9 pl-9"
              placeholder={
                barMode === 'advanced'
                  ? t('search.advanced_placeholder.string')
                  : t('search.placeholder.string')
              }
              value={barMode === 'advanced' ? advancedQueryText : activeValue}
              onChange={(e) => handleQueryInputChange(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            {isSearchActiveForAccount && (
              <button
                type="button"
                onClick={handleClearButtonClick}
                className="hover:bg-accent absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-gray-500 hover:text-gray-700"
                aria-label={t('search.clear.string')}
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {barMode === 'simple' && (
            <FormField
              control={simpleForm.control}
              name="fieldScope"
              render={({ field }) => (
                <FormItem className="w-56 shrink-0">
                  <MultiSelect
                    options={fieldScopeOptions}
                    selected={field.value}
                    onChange={handleFieldScopeChange}
                  />
                </FormItem>
              )}
            />
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => setAdvancedOpen(true)}
            aria-label={t('search.advanced.string')}
          >
            <Ellipsis className="size-4" />
          </Button>
        </div>
      </Form>

      <Dialog open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto pl-8 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('search.advanced.string')}</DialogTitle>
          </DialogHeader>
          <Form {...advancedForm}>
            <form
              className="grid gap-4"
              onSubmit={advancedForm.handleSubmit(handleAdvancedSubmit)}
            >
              <FormField
                control={advancedForm.control}
                name="folder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('search.folders.string')}</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        className="mr-2"
                        variant={field.value === 'all' ? 'default' : 'outline'}
                        onClick={() => field.onChange('all')}
                      >
                        {t('search.folders_all.string')}
                      </Button>
                      {inboxPath && (
                        <Button
                          type="button"
                          className="mr-2"
                          variant={field.value === inboxPath ? 'default' : 'outline'}
                          onClick={() => field.onChange(inboxPath)}
                        >
                          {t('folders.inbox.string')}
                        </Button>
                      )}
                      {draftsPath && (
                        <Button
                          type="button"
                          className="mr-2"
                          variant={field.value === draftsPath ? 'default' : 'outline'}
                          onClick={() => field.onChange(draftsPath)}
                        >
                          {t('folders.drafts.string')}
                        </Button>
                      )}
                      {sentPath && (
                        <Button
                          type="button"
                          className="mr-2"
                          variant={field.value === sentPath ? 'default' : 'outline'}
                          onClick={() => field.onChange(sentPath)}
                        >
                          {t('folders.sent.string')}
                        </Button>
                      )}
                      <SearchFolders
                        value={field.value}
                        onValueChange={field.onChange}
                        accountId={accountId}
                        pinnedPaths={[inboxPath, draftsPath, sentPath].filter(
                          (p): p is string => !!p
                        )}
                      />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={advancedForm.control}
                name="includeSubfolders"
                render={({ field }) => (
                  <FormItem className="flex items-center space-y-0 space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal">
                      {t('search.include_subfolders.string')}
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Separator className="my-1" />

              <div className="scrollbar-thin-gray max-h-[50vh] overflow-y-auto pr-2 pb-2 pl-2">
                <SearchMoreOptions form={advancedForm} open={advancedOpen} />
              </div>

              <Separator className="my-1" />

              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => advancedForm.reset(defaultSearchFormValues)}
                >
                  {formT('reset.default.string')}
                </Button>
                <Button type="submit">{t('search.confirm.string')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default memo(MailsSearch, (prev, next) => {
  return Object.is(prev, next) || JSON.stringify(prev) === JSON.stringify(next)
})

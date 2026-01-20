'use client'

import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Separator } from '../separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'

const hours24 = Array.from({ length: 24 }, (_, i) => i)
const hours12 = Array.from({ length: 12 }, (_, i) => i + 1)

const minutes5 = Array.from({ length: 12 }, (_, i) => i * 5)
const minutes1 = Array.from({ length: 60 }, (_, i) => i)

const hours = {
  '24h': hours24,
  am: hours12,
  pm: hours12,
}

const minutes: { [key: number]: number[] } = {
  5: minutes5,
  1: minutes1,
}
interface HoursRangePickerFormProps {
  form: object
  name: string
}

export function HoursRangePickerForm({
  form,
  name,
}: HoursRangePickerFormProps) {
  const t = useTranslations('CALENDAR')
  const [minutesInterval, setMinutesInterval] = useState<number>(5)
  const [hoursType, setHoursType] = useState<string>('24h')

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-full justify-between text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  {field.value ? (
                    format(field.value, 'HH:mm')
                  ) : (
                    <span>{t('pick.single.string')}</span>
                  )}
                  <Clock className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Tabs defaultValue="24h">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="24h" onClick={() => setHoursType('24h')}>
                    24h
                  </TabsTrigger>
                  <TabsTrigger value="am" onClick={() => setHoursType('am')}>
                    AM
                  </TabsTrigger>
                  <TabsTrigger value="pm" onClick={() => setHoursType('pm')}>
                    PM
                  </TabsTrigger>
                </TabsList>
                <TabsContent className="h-auto w-auto" value="24h">
                  <div>
                    <div className="grid grid-cols-12">
                      {hours24.map((hour) => (
                        <Button
                          key={hour}
                          variant="ghost"
                          className="p-1"
                          size={'icon'}
                        >
                          {hour}
                        </Button>
                      ))}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-12">
                      {minutes[minutesInterval].map((min) => (
                        <Button
                          key={min}
                          variant="ghost"
                          className="p-1"
                          size={'icon'}
                        >
                          {min}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="am" className="h-auto w-auto">
                  <div>
                    <div className="grid grid-cols-12">
                      {hours12.map((hour) => (
                        <Button
                          key={hour}
                          variant="ghost"
                          className="p-1"
                          size={'icon'}
                        >
                          {hour}
                        </Button>
                      ))}
                    </div>

                    <Separator />
                    <div className="grid grid-cols-12">
                      {minutes[minutesInterval].map((min) => (
                        <Button
                          key={min}
                          variant="ghost"
                          className="p-1"
                          size={'icon'}
                        >
                          {min}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="pm" className="h-auto w-auto">
                  <div>
                    <div className="grid grid-cols-12">
                      {hours12.map((hour) => (
                        <Button
                          key={hour}
                          variant="ghost"
                          className="p-1"
                          size={'icon'}
                        >
                          {hour}
                        </Button>
                      ))}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-12">
                      {minutes[minutesInterval].map((min) => (
                        <Button
                          key={min}
                          variant="ghost"
                          className="p-1"
                          size={'icon'}
                        >
                          {min}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <Button
                type="button"
                variant={'ghost'}
                className="w-full"
                size={'icon'}
                onClick={() =>
                  setMinutesInterval(minutesInterval === 5 ? 1 : 5)
                }
              >
                {minutesInterval === 5 ? <ChevronDown /> : <ChevronUp />}
              </Button>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default HoursRangePickerForm

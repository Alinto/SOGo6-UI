import { Construction } from 'lucide-react'

export const FeatureInProgress = () => {
  const text = 'Incoming Feature'
  return (
    <div
      data-testid="page-incoming-feature"
      className="flex min-h-[400px] items-center justify-center"
    >
      <div className="text-center">
        <Construction
          role="img"
          className="text-muted-foreground mx-auto mb-4 h-12 w-12"
          aria-label="Construction icon"
        />
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

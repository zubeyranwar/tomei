import { MagneticButton } from './magnetic-button'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <MagneticButton size="sm">Hover me</MagneticButton>
      <MagneticButton arrow>Get in touch</MagneticButton>
      <MagneticButton size="lg" contentStrength={0.4}>
        Start a project
      </MagneticButton>
    </div>
  )
}

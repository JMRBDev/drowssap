import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  FieldGroup,
  FieldTitle,
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
} from "@/components/ui/field"
import { useTheme } from "@/components/theme-provider"
import type { Settings } from "@/lib/types"

type SettingsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: Settings
  onSettingsChange: (partial: Partial<Settings>) => void
}

export function SettingsSheet({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: SettingsSheetProps) {
  const { theme, setTheme } = useTheme()

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="overflow-y-auto">
        <DrawerHeader className="mb-8 border-b">
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>
            Configure generator options and themes.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex h-full flex-col gap-8 px-4 pb-8">
          <FieldGroup className="flex-1">
            <Field>
              <FieldTitle>Theme</FieldTitle>
              <ToggleGroup
                type="single"
                value={theme}
                onValueChange={(v) => {
                  if (v) setTheme(v as "light" | "dark" | "system")
                }}
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem value="light">Light</ToggleGroupItem>
                <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
                <ToggleGroupItem value="system">System</ToggleGroupItem>
              </ToggleGroup>
            </Field>

            <SwitchRow
              label="Play sound on generation"
              checked={settings.soundEnabled}
              onCheckedChange={(v) => onSettingsChange({ soundEnabled: v })}
            />
          </FieldGroup>

          <Separator />

          <FieldGroup>
            <FieldTitle>About &amp; Trust</FieldTitle>
            <FieldDescription>drowssap v0.0.1</FieldDescription>
            <FieldDescription>
              Built with Web Crypto API for cryptographically secure randomness.
            </FieldDescription>
            <FieldDescription>
              Memorable passphrases use the{" "}
              <a
                href="https://www.eff.org/dice"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                EFF wordlist
              </a>
              .
            </FieldDescription>
            <FieldDescription>Open source. Audit the code.</FieldDescription>
          </FieldGroup>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function SwitchRow({
  label,
  checked,
  onCheckedChange,
  disabled,
  hint,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  hint?: string
}) {
  return (
    <>
      <Field orientation="horizontal">
        <FieldLabel>{label}</FieldLabel>

        <FieldContent className="items-end">
          <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            aria-label={label}
          />
        </FieldContent>
      </Field>

      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
    </>
  )
}

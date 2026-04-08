export async function sharePassword(value: string): Promise<boolean> {
  if (!navigator.share) return false
  try {
    await navigator.share({ title: "Password", text: value })
    return true
  } catch {
    return false
  }
}

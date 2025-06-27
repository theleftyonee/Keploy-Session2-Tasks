import { render } from "@testing-library/react"
import { ThemeProvider } from "@/components/theme-provider"

// Mock next-themes
jest.mock("next-themes", () => ({
  ThemeProvider: ({ children, ...props }: any) => (
    <div data-testid="theme-provider" {...props}>
      {children}
    </div>
  ),
}))

describe("ThemeProvider", () => {
  it("should render with children", () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    )

    expect(getByTestId("theme-provider")).toBeInTheDocument()
    expect(getByText("Test Content")).toBeInTheDocument()
  })

  it("should pass props to next-themes provider", () => {
    const { getByTestId } = render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div>Test Content</div>
      </ThemeProvider>
    )

    const provider = getByTestId("theme-provider")
    expect(provider).toHaveAttribute("attribute", "class")
    expect(provider).toHaveAttribute("defaultTheme", "dark")
  })

  it("should handle multiple children", () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ThemeProvider>
    )

    expect(getByText("Child 1")).toBeInTheDocument()
    expect(getByText("Child 2")).toBeInTheDocument()
    expect(getByText("Child 3")).toBeInTheDocument()
  })

  it("should handle empty children", () => {
    const { getByTestId } = render(<ThemeProvider />)

    expect(getByTestId("theme-provider")).toBeInTheDocument()
  })
}) 
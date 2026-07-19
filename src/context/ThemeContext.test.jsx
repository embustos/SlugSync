import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY, ThemeProvider, useTheme } from "./ThemeContext";

function createMatchMediaMock(initialMatches) {
  let matches = initialMatches;
  let listeners = [];

  return {
    get matches() {
      return matches;
    },
    media: "(prefers-color-scheme: dark)",
    addEventListener: (event, callback) => {
      if (event === "change") listeners.push(callback);
    },
    removeEventListener: (event, callback) => {
      listeners = listeners.filter((listener) => listener !== callback);
    },
    __setMatches(next) {
      matches = next;
      listeners.forEach((callback) => callback({ matches }));
    },
  };
}

function ThemeProbe() {
  const { themePreference, resolvedTheme, setThemePreference } = useTheme();
  return (
    <div>
      <span data-testid="preference">{themePreference}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setThemePreference("light")} type="button">
        light
      </button>
      <button onClick={() => setThemePreference("dark")} type="button">
        dark
      </button>
      <button onClick={() => setThemePreference("system")} type="button">
        system
      </button>
    </div>
  );
}

describe("ThemeContext", () => {
  let mql;

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    mql = createMatchMediaMock(false);
    vi.stubGlobal("matchMedia", vi.fn(() => mql));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to system preference, resolved from the OS scheme", () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("preference")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("selects dark mode and updates the root attribute and storage", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await user.click(screen.getByText("dark"));

    expect(screen.getByTestId("preference")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("selects light mode explicitly, overriding a dark OS preference", async () => {
    mql.__setMatches(true);
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await user.click(screen.getByText("light"));

    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("follows the OS scheme while on system and reacts to live changes", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await user.click(screen.getByText("dark"));
    await user.click(screen.getByText("system"));
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");

    act(() => {
      mql.__setMatches(true);
    });

    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("restores a saved preference after reload", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("preference")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("ignores a corrupted stored value and falls back to system", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "purple");

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("preference")).toHaveTextContent("system");
  });
});

// __tests__/components/Footer.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../../src/app/components/Footer"; // Adjust the path as needed
import "@testing-library/jest-dom";

describe("Footer Component", () => {
  beforeEach(() => {
    render(<Footer />);
  });

  test("renders agency tagline", () => {
    expect(
      screen.getByText(/One window for everything you do on the internet/i)
    ).toBeInTheDocument();
    // Check that the trademark symbol is present as superscript
    expect(screen.getByText("®")).toBeInTheDocument();
  });

  test("renders London office contact info", () => {
    // London header
    expect(screen.getByText("London")).toBeInTheDocument();
    // London email link
    const londonEmailLink = screen.getByRole("link", {
      name: /sayHi@shift.com/i,
    });
    expect(londonEmailLink).toHaveAttribute("href", "mailto:sayHi@shift.com");

    // Use a custom matcher to find phone number text across elements.
    const londonPhone = screen.getByText((content) =>
      content.includes("+44 20 7987 7571")
    );
    expect(londonPhone).toBeInTheDocument();
    expect(
      screen.getByText(/Unit 306, Metropolitan Wharf,/i)
    ).toBeInTheDocument();
  });

  test("renders Buenos Aires office contact info", () => {
    expect(screen.getByText("Buenos Aires")).toBeInTheDocument();
    const buenosAiresEmail = screen.getByRole("link", {
      name: /buenosaires@weareimpatient.com/i,
    });
    expect(buenosAiresEmail).toHaveAttribute(
      "href",
      "mailto:buenosaires@weareimpatient.com"
    );

    // Use a function matcher for the phone number.
    const buenosAiresPhone = screen.getByText((content) =>
      content.includes("+54 11 6799 7949")
    );
    expect(buenosAiresPhone).toBeInTheDocument();
  });

  test("renders newsletter section", () => {
    // Newsletter heading
    expect(
      screen.getByText(/Want to be the smartest in your office\?/i)
    ).toBeInTheDocument();
    // Newsletter link
    const newsletterLink = screen.getByRole("link", {
      name: /Sign up for our newsletter/i,
    });
    expect(newsletterLink).toBeInTheDocument();
  });

  test("renders social media links with correct attributes", () => {
    const facebookLink = screen.getByRole("link", { name: "Facebook" });
    expect(facebookLink).toHaveAttribute("href", "https://www.facebook.com/");
    expect(facebookLink).toHaveAttribute("target", "_blank");
    expect(facebookLink).toHaveAttribute("rel", "noopener noreferrer");

    const twitterLink = screen.getByRole("link", { name: "Twitter" });
    expect(twitterLink).toHaveAttribute("href", "https://www.twitter.com/");
    expect(twitterLink).toHaveAttribute("target", "_blank");
    expect(twitterLink).toHaveAttribute("rel", "noopener noreferrer");

    const linkedinLink = screen.getByRole("link", { name: "LinkedIn" });
    expect(linkedinLink).toHaveAttribute("href", "https://www.linkedin.com/");
    expect(linkedinLink).toHaveAttribute("target", "_blank");
    expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");

    const instagramLink = screen.getByRole("link", { name: "Instagram" });
    expect(instagramLink).toHaveAttribute("href", "https://www.instagram.com/");
    expect(instagramLink).toHaveAttribute("target", "_blank");
    expect(instagramLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});

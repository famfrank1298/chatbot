import { useEffect, useState } from "react";
import "./About.css";

export default function About() {
  const text = "Who we Are:";
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex !== text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1) + "_");
        currentIndex++;
      } else {
        setDisplayedText(text);
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="about-container">
      <h1>{displayedText}</h1>
      <p className="about-text">
        FamFinance is your go-to platform for kickstarting your investment
        journey. <br />
        <br />
        We specialize in guiding young investors through the world of finance
        with easy navigation, comprehensive features, and valuable educational
        resources. Our customer support AI is here to assist with everything
        from long-term investment strategies and various investment types to
        finding the best investing platforms and finance YouTubers.
        <br />
        <br /> Let us help you build a strong foundation for your financial
        future.
      </p>
    </div>
  );
}

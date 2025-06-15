import React, { useState } from "react";
import axios from "axios";
import { speak, listen } from "./voice"; // voice.js as below

const App = () => {
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  const fetchRecipeSteps = async (query) => {
    const apiKey = "b0eec2787469496799c0c8869d4c87a4"; // 🔑 Replace with your real key
    try {
      const searchURL = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${query}`;
      const searchRes = await axios.get(searchURL);
      const recipeId = searchRes.data.results[0]?.id;

      if (!recipeId) {
        speak("Sorry, I couldn't find that recipe.");
        return;
      }

      const infoURL = `https://api.spoonacular.com/recipes/${recipeId}/analyzedInstructions?apiKey=${apiKey}`;
      const infoRes = await axios.get(infoURL);
      const instructions =
        infoRes.data[0]?.steps.map((step) => step.step) || [];

      if (instructions.length === 0) {
        speak("Sorry, no instructions found for that recipe.");
        return;
      }

      setSteps(instructions);
      setStepIndex(0);
      speak(`Step 1: ${instructions[0]}`);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      speak("There was an error fetching the recipe.");
    }
  };

  const handleVoiceCommand = (input) => {
    const command = input.toLowerCase();

    if (command.includes("get recipe for")) {
      const dish = command.split("get recipe for")[1]?.trim();
      fetchRecipeSteps(dish);
    } else if (command.includes("next step")) {
      const next = stepIndex + 1;
      if (next < steps.length) {
        setStepIndex(next);
        speak(`Step ${next + 1}: ${steps[next]}`);
      } else {
        speak("You have reached the end of the recipe.");
      }
    } else if (command.includes("repeat step")) {
      speak(`Step ${stepIndex + 1}: ${steps[stepIndex]}`);
    } else {
      speak("Sorry, I didn’t understand that.");
    }
  };

  const startListening = () => {
    listen((voiceInput) => {
      handleVoiceCommand(voiceInput);
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>👩‍🍳 Voice Recipe Assistant</h1>
      <button onClick={startListening}>🎤 Start Talking</button>
      <div style={{ marginTop: "20px" }}>
        {steps.length > 0 &&
          steps.map((step, i) => (
            <p key={i} style={{ color: i === stepIndex ? "blue" : "black" }}>
              Step {i + 1}: {step}
            </p>
          ))}
      </div>
    </div>
  );
};

export default App;

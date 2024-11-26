# Skribbllle.io Clone - Multiplayer Drawing & Guessing Game

Welcome to **Skribbllle.io**, a fun multiplayer drawing and guessing game where friends can play together, compete, and have a blast! This project is a clone of the popular game **Skribbl.io**, with real-time interactions, colorful drawings, and a scoreboard that updates instantly. 🖌️🎨

## How It Works

- **Players:** All players take turns drawing and guessing.
- **Drawing:** The selected player is given a random word and has 60 seconds to draw it on the canvas.
  - **Canvas Tools:** Multiple colors are available, and there's a **clear button** to erase the drawing.
- **Guessing:** The other players guess the word by typing it into the message section.
  - **Points:** A correct guess earns **100 points**.
- **Real-Time Scoring:** The scoreboard is updated in real-time for all players to see.
- **Game End:** After each round, players are ranked based on their score, and the game ends with a winner crowned! 🏆

![2](https://github.com/user-attachments/assets/0c97073f-0aca-4b63-a9f1-fe5871e2650a)
![1](https://github.com/user-attachments/assets/dedb2f1c-0363-4ad9-86ce-6f98a2160d29)
![4](https://github.com/user-attachments/assets/eb28c156-e89c-4388-96b5-6e5298c56090)


## Features

- **Multiplayer gameplay** for friends to join and play together.
- **Real-time drawing and guessing** with immediate feedback.
- **60-second rounds** to keep the action fast and fun.
- **Live leaderboard** that updates after every round.
- **Colorful drawing canvas** with clear and customizable drawing tools.

## Tech Stack

- **Backend:**
  - **Node.js** - JavaScript runtime for building the server.
  - **Express.js** - Web framework for routing and handling HTTP requests.
  - **WebSocket** - For real-time, bidirectional communication between the server and clients.
  
- **Frontend:**
  - **Next.js** - React-based framework for building the user interface and handling routing.
  - **React.js** - For building interactive UI components.
  - **Tailwind CSS** - For styling and making the design responsive and modern.
  - **Aceternity UI** - A UI library to enhance user experience.

- **Deployment:**
  - **Vercel** - For hosting and deploying the app with high performance.

## Getting Started

To run this project locally, follow the steps below:

### Prerequisites

1. **Node.js**: Make sure you have **Node.js** installed. If not, download it from [here](https://nodejs.org/).
2. **Git**: Install **Git** to clone the repository. Download it from [here](https://git-scm.com/).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/skribbllle-io.git
   ```

2. Install dependencies:
   ```bash
   cd skribbllle-io
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to `http://localhost:3000` to play the game!
  
5. Create an `.env` file in the apps/web folder of your project and add the following:

   ```
   WS_URL=ws://your-websocket-server-url
   ```

   **Note:** Replace `your-websocket-server-url` with the actual WebSocket server URL you're using for your backend.

## Contributing

Feel free to fork this project, report bugs, or create pull requests! Contributions are always welcome.  

### How to Contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Create a new pull request.

## License

This project is open-source and available under the [MIT License](LICENSE).

## Acknowledgements

A big thank you to **Harkirat Singh** for his valuable guidance and inspiration for this project! 🙌

## Links

- [GitHub Repository](https://github.com/your-username/skribbllle-io)
- [Live Demo (Vercel)](https://your-app-name.vercel.app)

---

### Enjoy playing and let your creativity flow! ✏️






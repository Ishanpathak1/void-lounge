// pages/index.js
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Void Lounge</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0a0a1a" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>

      <canvas id="particles"></canvas>
      <div id="dashboard-toggle">👁</div>
      <div id="user-dashboard" className="hidden"></div>
      <div id="message-container"></div>

      <form id="chat-form" autoComplete="off">
        <input
          type="text"
          id="message-input"
          placeholder="drop a thought..."
          autoComplete="off"
        />
      </form>

      <audio id="ambience" autoPlay loop>
        <source
          src="https://cdn.pixabay.com/download/audio/2022/02/23/audio_16728c7a56.mp3?filename=ambient-105276.mp3"
          type="audio/mpeg"
        />
      </audio>

      <script type="module" src="/main.js"></script>
    </>
  );
}


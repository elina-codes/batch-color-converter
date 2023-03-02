import styles from "./App.module.css";
import ConversionView from "./ConversionView";

export default function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleHighlight}>Batch Color Converter</span>
        </h1>
        <h2 className={styles.subTitle}>
          Convert multiple colors with the click of a button
        </h2>
      </header>
      <main className={styles.content}>
        <ConversionView />
      </main>
    </div>
  );
}

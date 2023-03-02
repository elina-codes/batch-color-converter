import { SyntheticEvent, useState, useRef, useEffect } from "react";
import {
  MdContentCopy as CopyIcon,
  MdDoubleArrow as ConvertIcon,
  MdCheck as ConfirmCopyIcon,
} from "react-icons/md";
import { useCopyToClipboard } from "usehooks-ts";
import styles from "./ConversionView.module.css";
import { colorFormats, ConversionType } from "./helpers";
var convert = require("color-convert");

export default function ConversionView() {
  const [, copy] = useCopyToClipboard();
  const [result, setResult] = useState<string>("");
  const [fromType, setFromType] = useState<ConversionType>(colorFormats[0]);
  const [toType, setToType] = useState<ConversionType>(colorFormats[1]);
  const [error, setError] = useState<boolean>(false);
  const [isConfirmCopyVisible, setIsConfirmCopyVisible] = useState(false);

  const fromTypeRef = useRef<HTMLTextAreaElement>(null);
  const toTypeRef = useRef<HTMLTextAreaElement>(null);

  const handleCopyClick = (e: SyntheticEvent) => {
    e.preventDefault();
    copy(result);
    setIsConfirmCopyVisible(true);
  };

  useEffect(() => {
    if (isConfirmCopyVisible) {
      const timeout = setTimeout(() => setIsConfirmCopyVisible(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [isConfirmCopyVisible]);

  const onTypeClick = (
    e: SyntheticEvent,
    value: ConversionType,
    type: "from" | "to"
  ) => {
    e.preventDefault();
    if (type === "from") {
      setFromType(value);
    } else {
      setToType(value);
    }
  };

  const reset = () => {
    if (fromTypeRef.current) fromTypeRef.current.value = "";
    setResult("");
    setError(false);
  };

  const handleReset = (e: SyntheticEvent) => {
    e.preventDefault();
    reset();
  };

  const handleTypeClick = (
    e: SyntheticEvent,
    value: ConversionType,
    type: "from" | "to"
  ) => {
    e.preventDefault();
    onTypeClick(e, value, type);
  };

  const convertColors = async (colors: string) => {
    const sanitize = (value: string) => {
      const pattern = new RegExp(`^${fromType}\((.*?)\)$`);
      return value.replace(pattern, "$1");
    };

    const formatColor = (value: Number[]) => {
      switch (toType) {
        case "rgb":
          return `rgb(${value})`;
        case "hsl":
          return `hsl(${value[0]},${value[1]}%,${value[2]}%)`;
        case "hsv":
          return `hsv(${value[0]},${value[1]}%,${value[2]}%)`;
        case "hwb":
          return `hwb(${value})`;
        case "cmyk":
          return `cmyk(${value.map((v) => `${v}%`)})`;
        case "hex":
          return `#${value}`;
        default:
          return value;
      }
    };

    try {
      setError(false);
      const inputArray = colors.split("\n");
      const result = await inputArray.map((input: string) => {
        const sanitized = sanitize(input);
        const converted = convert[fromType][toType](sanitized);
        if (converted.includes(NaN)) {
          throw new Error("Invalid color");
        }

        const convertedString = formatColor(converted);
        return convertedString;
      });
      return result;
    } catch (error) {
      setError(true);
      return [];
    }
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const value = fromTypeRef?.current?.value || "";
    const result = await convertColors(value);
    setResult(result.join("\n"));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <div className={styles.textboxContainer}>
        <div className={styles.tabs}>
          {colorFormats.map((format) => (
            <button
              key={format}
              className={
                fromType === format
                  ? styles.active
                  : toType === format
                  ? styles.disabled
                  : ""
              }
              disabled={toType === format}
              onClick={(e) => handleTypeClick(e, format, "from")}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
        <label className={styles.label}>
          <div className={styles.labelText}>
            {fromType.toUpperCase()}{" "}
            {error && (
              <span className={styles.error}>
                Error: Invalid {fromType.toUpperCase()} format
              </span>
            )}
          </div>
          <textarea
            id={fromType}
            name={fromType}
            rows={10}
            cols={30}
            className={styles.codeContainer}
            ref={fromTypeRef}
            placeholder={`rgb(253,29,29)
rgb(114, 0, 227)
rgb(248, 97, 43)`}
          />
        </label>
      </div>

      <div className={styles.buttonContainer}>
        <button title="Convert" type="submit" className={styles.submitButton}>
          <ConvertIcon size={30} />
        </button>
        <button
          title="Reset"
          onClick={handleReset}
          className={styles.resetButton}
        >
          Reset
        </button>
      </div>

      <div className={styles.textboxContainer}>
        <label className={styles.label}>
          {toType.toUpperCase()}
          <div className={styles.outputWrapper}>
            <textarea
              value={result}
              id={toType}
              name={toType}
              className={styles.codeContainer}
              ref={toTypeRef}
              readOnly
            />
            <button
              onClick={handleCopyClick}
              className={styles.copyButton}
              disabled={!result}
              title="Copy to clipboard"
            >
              {isConfirmCopyVisible ? (
                <ConfirmCopyIcon size={30} color="#20c437" />
              ) : (
                <CopyIcon size={30} />
              )}
            </button>
          </div>
        </label>
        <div className={styles.tabs}>
          {colorFormats.map((format) => (
            <button
              key={format}
              className={
                toType === format
                  ? styles.active
                  : fromType === format
                  ? styles.disabled
                  : ""
              }
              disabled={fromType === format}
              onClick={(e) => handleTypeClick(e, format, "to")}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

import styles from "./HttpBody.module.css";
import { BodyData } from "@recordreplay/protocol";
import { useMemo, useState } from "react";
import ReactJson from "react-json-view";
import MaterialIcon from "../shared/MaterialIcon";
import BodyDownload from "./BodyDownload";
import {
  BodyPartsToArrayBuffer,
  Displayable,
  RawBody,
  RawToUTF8,
  StringToObjectMaybe,
  TextBody,
  URLEncodedToPlaintext,
} from "./content";
import classNames from "classnames";

const TextBodyComponent = ({ raw, text }: { raw: RawBody; text: string }) => {
  const [copied, setCopied] = useState(false);

  return (
    <div
      className={classNames(styles["copy-container"], "relative pr-6")}
      style={{ width: "fit-content" }}
    >
      <pre className="whitespace-pre-wrap">
        {text}
        <div
          className="absolute z-10 top-0 right-1"
          onClick={() => {
            const asString = RawToUTF8(raw) as TextBody;
            const blob = new Blob([asString.content], { type: "text/plain" });
            navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          <MaterialIcon
            className={classNames(styles["copy-icon"], { "text-primaryAccent": copied })}
          >
            content_copy
          </MaterialIcon>
        </div>
      </pre>
    </div>
  );
};

const HttpBody = ({
  bodyParts,
  contentType,
  filename,
}: {
  bodyParts: BodyData[];
  contentType: string;
  filename: string;
}) => {
  const raw = useMemo(() => {
    return BodyPartsToArrayBuffer(bodyParts, contentType);
  }, [bodyParts]);

  const displayable = useMemo(() => {
    return StringToObjectMaybe(URLEncodedToPlaintext(RawToUTF8(raw)));
  }, [raw]);

  if (displayable.as === Displayable.JSON) {
    return <ReactJson src={displayable.content} shouldCollapse={() => true} />;
  }
  if (displayable.as === Displayable.Text) {
    return (
      <>
        <TextBodyComponent raw={raw} text={displayable.content} />
      </>
    );
  }
  if (displayable.as === Displayable.Raw) {
    return (
      <>
        <div className="flex items-center">
          <p>
            This content-type ({contentType}) cannot be displayed, but you can download the
            response.
          </p>
          <BodyDownload raw={raw} filename={filename} />
        </div>
      </>
    );
  }
  return null;
};

export default HttpBody;

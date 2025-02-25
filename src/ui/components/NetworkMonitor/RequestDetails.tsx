import React, { useEffect, useMemo, useState } from "react";
import { findHeader, RequestSummary } from "./utils";
import styles from "./RequestDetails.module.css";
import classNames from "classnames";
import sortBy from "lodash/sortBy";
import PanelTabs from "devtools/client/shared/components/PanelTabs";
import ComingSoon from "./ComingSoon";
import CloseButton from "devtools/client/debugger/src/components/shared/Button/CloseButton";
import { Frames } from "../../../devtools/client/debugger/src/components/SecondaryPanes/Frames";
import { WiredFrame } from "protocol/thread/pause";
import { RequestBodyData, ResponseBodyData } from "@recordreplay/protocol";
import ResponseBody from "./ResponseBody";
import { useFeature } from "ui/hooks/settings";
import RequestBody from "./RequestBody";

interface Detail {
  name: string;
  value: string | React.ReactChild;
}

function FormattedUrl({ url }: { url: string }) {
  const parsedUrl = new URL(url);
  const params = [...parsedUrl.searchParams.entries()];
  return (
    <span className="text-gray-600">
      <span className="">{parsedUrl.origin}</span>
      <span className="">{parsedUrl.pathname}</span>
      {params.length > 0 ? (
        <>
          {params.map(([key, value], index) => (
            <span key={key}>
              <span className="">{index == 0 ? "?" : "&"}</span>
              <span className="text-primaryAccent">{key}</span>
              <span>={value}</span>
            </span>
          ))}
        </>
      ) : null}
    </span>
  );
}

const DetailTable = ({ className, details }: { className?: string; details: Detail[] }) => {
  return (
    <div className={classNames(className, "flex flex-col")}>
      {details.map((h, i) => (
        <div className={classNames(styles.row, "hover:bg-gray-100 py-1")} key={`${h.name}-${i}`}>
          <span className="font-bold ">{h.name}:</span> {h.value}
        </div>
      ))}
    </div>
  );
};

export const TriangleToggle = ({ open }: { open: boolean }) => (
  <span
    className={classNames("p-3 select-none img arrow", { expanded: open })}
    style={{ marginInlineEnd: "4px" }}
  />
);

const parseCookie = (str: string): Record<string, string> => {
  return str
    .split(";")
    .map(v => v.split("="))
    .reduce((acc: Record<string, string>, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
};

const Cookies = ({ request }: { request: RequestSummary }) => {
  return (
    <div>
      <h2 className={classNames("p-4 py-1 border-t cursor-pointer font-bold", styles.title)}>
        Request Cookies
      </h2>
      <DetailTable
        className={styles.request}
        details={Object.entries(
          parseCookie(findHeader(request?.requestHeaders, "cookie") || "")
        ).map((value: [string, string]) => {
          return { name: value[0], value: value[1] };
        })}
      />
    </div>
  );
};

const StackTrace = ({
  cx,
  frames,
  selectFrame,
}: {
  cx: any;
  frames: WiredFrame[];
  selectFrame: (cx: any, frame: WiredFrame) => void;
}) => {
  return (
    <div>
      <h1 className="p-3 font-bold">Stack Trace</h1>
      <div className="px-2">
        <Frames cx={cx} framesLoading={true} frames={frames} selectFrame={selectFrame} />
      </div>
    </div>
  );
};

const HeadersPanel = ({ request }: { request: RequestSummary }) => {
  const [requestExpanded, setRequestExpanded] = useState(true);
  const [requestHeadersExpanded, setRequestHeadersExpanded] = useState(true);
  const [responseHeadersExpanded, setResponseHeadersExpanded] = useState(true);
  const [queryParametersExpanded, setQueryParametersExpanded] = useState(true);

  const requestHeaders = useMemo(
    () => sortBy(request.requestHeaders, r => r.name.toLowerCase()),
    [request]
  );
  const responseHeaders = useMemo(
    () => sortBy(request.responseHeaders, r => r.name.toLowerCase()),
    [request]
  );
  return (
    <>
      <div
        className={classNames("flex items-center py-1 cursor-pointer font-bold")}
        onClick={() => setRequestExpanded(!requestExpanded)}
      >
        <TriangleToggle open={requestExpanded} />
        General
      </div>
      {requestExpanded && (
        <DetailTable
          className={styles.request}
          details={[
            { name: "URL", value: <FormattedUrl url={request.url} /> },
            { name: "Request Method", value: request.method },
            { name: "Status Code", value: String(request.status) },
            { name: "Type", value: request.documentType },
            { name: "Start", value: `${request.start}ms` },
            { name: "First byte time", value: `${request.end}ms` },
          ]}
        />
      )}
      <h2
        className={classNames("py-1 border-t cursor-pointer font-bold", styles.title)}
        onClick={() => setRequestHeadersExpanded(!requestHeadersExpanded)}
      >
        <TriangleToggle open={requestHeadersExpanded} />
        Request Headers
      </h2>
      {requestHeadersExpanded && (
        <DetailTable className={styles.headerTable} details={requestHeaders} />
      )}
      {request.responseHeaders.length > 0 && (
        <>
          <h2
            className={classNames("py-1 border-t cursor-pointer font-bold", styles.title)}
            onClick={() => setResponseHeadersExpanded(!responseHeadersExpanded)}
          >
            <TriangleToggle open={responseHeadersExpanded} />
            Response Headers
          </h2>
          {responseHeadersExpanded && (
            <DetailTable className={styles.headerTable} details={responseHeaders} />
          )}
          {request.queryParams.length && (
            <div>
              <h2
                className={classNames("py-1 border-t cursor-pointer font-bold", styles.title)}
                onClick={() => setQueryParametersExpanded(!queryParametersExpanded)}
              >
                <TriangleToggle open={queryParametersExpanded} />
                Query Parameters
              </h2>
              {queryParametersExpanded && (
                <DetailTable
                  className={classNames("py-1", styles.request)}
                  details={request.queryParams.map(x => ({
                    name: x[0],
                    value: x[1],
                  }))}
                />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

const DEFAULT_TAB = "headers";

const RequestDetails = ({
  closePanel,
  cx,
  frames,
  request,
  requestBody,
  responseBody,
  selectFrame,
}: {
  closePanel: () => void;
  cx: any;
  frames: WiredFrame[];
  request: RequestSummary;
  responseBody: ResponseBodyData[] | undefined;
  requestBody: RequestBodyData[] | undefined;
  selectFrame: (cx: any, frame: WiredFrame) => void;
}) => {
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);

  const { value: httpBodies } = useFeature("httpBodies");

  const tabs = [
    { id: "headers", title: "Headers", visible: true },
    {
      id: "cookies",
      title: "Cookies",
      visible: Boolean(findHeader(request.requestHeaders, "cookie")),
    },
    { id: "request", title: "Request", visible: request.hasRequestBody && httpBodies },
    { id: "response", title: "Response", visible: request.hasResponseBody && httpBodies },
    { id: "stackTrace", title: "Stack Trace", visible: Boolean(request.triggerPoint) },
    { id: "timings", title: "Timings", visible: true },
  ];

  const activeTabs = tabs.filter(t => t.visible);

  useEffect(() => {
    if (!activeTabs.find(t => t.id === activeTab)) {
      setActiveTab(DEFAULT_TAB);
    }
  }, [activeTab, activeTabs]);

  return (
    <div className="bg-white border-l min-w-full overflow-scroll">
      <div
        className="flex border-b justify-between bg-toolbarBackground items-center sticky z-10 top-0"
        style={{ height: 25 }}
      >
        <PanelTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <CloseButton buttonClass="mr-4" handleClick={closePanel} tooltip={"Close tab"} />
      </div>
      <div className={classNames("requestDetails", styles.requestDetails)}>
        <div>
          {activeTab == "headers" && <HeadersPanel request={request} />}
          {activeTab == "cookies" && <Cookies request={request} />}
          {activeTab == "response" && (
            <ResponseBody request={request} responseBodyParts={responseBody} />
          )}
          {activeTab == "request" && (
            <RequestBody request={request} requestBodyParts={requestBody} />
          )}
          {activeTab == "stackTrace" && (
            <StackTrace cx={cx} frames={frames} selectFrame={selectFrame} />
          )}
          {activeTab == "timings" && <ComingSoon />}
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;

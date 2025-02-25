import React from "react";
import styles from "./RequestTable.module.css";
import classNames from "classnames";
import { RequestSummary } from "./utils";
import { HeaderGroups } from "./HeaderGroups";
import { RequestRow } from "./RequestRow";
import { Row, TableInstance } from "react-table";

const RequestTable = ({
  className,
  currentTime,
  data,
  onRowSelect,
  seek,
  selectedRequest,
  table,
}: {
  className?: string;
  currentTime: number;
  data: RequestSummary[];
  onRowSelect: (request: RequestSummary) => void;
  seek: (point: string, time: number, hasFrames: boolean, pauseId?: string | undefined) => boolean;
  selectedRequest?: RequestSummary;
  table: TableInstance<RequestSummary>;
}) => {
  const { columns, getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = table;

  const onSeek = (request: RequestSummary) => {
    seek(request.point.point, request.point.time, true);
    onRowSelect(request);
  };

  let inPast = true;

  return (
    <div className={classNames("no-scrollbar bg-white min-w-full overflow-scroll", className)}>
      {/* Relative here helps with when the timeline goes past the last request*/}
      <div
        style={{ minWidth: "fit-content" }}
        className={classNames(styles.request, "relative")}
        {...getTableProps()}
      >
        <div className="sticky z-10 top-0 bg-toolbarBackground border-b">
          <HeaderGroups columns={columns} headerGroups={headerGroups} />
        </div>
        <div style={{ minWidth: "fit-content" }} {...getTableBodyProps()}>
          {rows.map((row: Row<RequestSummary>) => {
            let firstInFuture = false;
            if (inPast && row.original.point.time >= currentTime) {
              inPast = false;
              firstInFuture = true;
            }

            prepareRow(row);

            return (
              <RequestRow
                currentTime={currentTime}
                isFirstInFuture={firstInFuture}
                isInPast={inPast}
                isSelected={selectedRequest?.id === row.original.id}
                key={row.getRowProps().key}
                onClick={onRowSelect}
                onSeek={onSeek}
                row={row}
              />
            );
          })}
          <div
            className={classNames({
              [styles.current]: data.every(r => (r.point?.time || 0) < currentTime),
              [styles.end]: data.every(r => (r.point?.time || 0) < currentTime),
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default RequestTable;

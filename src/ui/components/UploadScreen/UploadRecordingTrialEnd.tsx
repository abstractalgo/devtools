import React from "react";
import { Workspace } from "ui/types";
import { subscriptionEndsIn, inUnpaidFreeTrial } from "ui/utils/workspace";

export function UploadRecordingTrialEnd({
  workspaces,
  selectedWorkspaceId,
}: {
  workspaces: Workspace[];
  selectedWorkspaceId: string | null;
}) {
  const workspace = workspaces.find(w => w.id === selectedWorkspaceId);

  if (!workspace) {
    return null;
  }

  const expiresIn = subscriptionEndsIn(workspace);
  if (expiresIn > 0 && !inUnpaidFreeTrial(workspace)) {
    return null;
  }

  return (
    <div className="absolute top-0 p-2 px-3 bg-white transform -translate-y-1/2 rounded-lg z-10 shadow-lg">
      Your trial is expiring in {expiresIn} days
    </div>
  );
}

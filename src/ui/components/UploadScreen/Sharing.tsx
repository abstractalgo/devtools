import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import hooks from "ui/hooks";
import TeamSelect from "./TeamSelect";
import { Workspace } from "ui/types";
import { Toggle } from "../shared/Forms";
import SettingsPreview from "./SettingsPreview";
import classNames from "classnames";
import { isPublicDisabled } from "ui/utils/org";

export const MY_LIBRARY = "My Library";
export const personalWorkspace = { id: MY_LIBRARY, name: MY_LIBRARY };

type SharingProps = {
  workspaces: Workspace[];
  selectedWorkspaceId: string;
  setSelectedWorkspaceId: Dispatch<SetStateAction<string>>;
  isPublic: boolean;
  setIsPublic: Dispatch<SetStateAction<boolean>>;
};

function EditableSettings({
  workspaces,
  selectedWorkspaceId,
  setSelectedWorkspaceId,
  isPublic,
  setIsPublic,
}: Omit<SharingProps, "showSharingSettings">) {
  const updateDefaultWorkspace = hooks.useUpdateDefaultWorkspace();
  const publicDisabled = isPublicDisabled(workspaces, selectedWorkspaceId);

  const handleWorkspaceSelect = (id: string) => {
    setIsPublic(isPublic && !isPublicDisabled(workspaces, id));
    setSelectedWorkspaceId(id);
    const dbWorkspaceId = id === "My Library" ? null : id;
    updateDefaultWorkspace({ variables: { workspaceId: dbWorkspaceId } });
  };

  return (
    <div className="w-full grid grid-cols-2 gap-5 text-base">
      {workspaces.length ? (
        <TeamSelect {...{ workspaces, handleWorkspaceSelect, selectedWorkspaceId }} />
      ) : null}
      <div
        className={classNames(
          publicDisabled ? "opacity-60" : undefined,
          "space-x-2 select-none flex flex-row items-center justify-between w-full border border-textFieldBorder rounded-md shadow-sm px-2.5 py-1.5 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-primaryAccent focus:border-primaryAccentHover bg-jellyfish"
        )}
        onClick={() => !publicDisabled && setIsPublic(!isPublic)}
      >
        <div>Public Access</div>
        <Toggle
          enabled={isPublic && !publicDisabled}
          setEnabled={publicDisabled ? () => {} : setIsPublic}
        />
      </div>
    </div>
  );
}

export default function Sharing(props: SharingProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="relative">
      {isEditing ? (
        <EditableSettings {...props} />
      ) : (
        <SettingsPreview {...props} onClick={() => setIsEditing(!isEditing)} />
      )}
    </div>
  );
}

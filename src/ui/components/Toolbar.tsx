import React from "react";
import classnames from "classnames";
import { connect, ConnectedProps, useDispatch, useSelector } from "react-redux";
import { actions } from "../actions";
import { selectors } from "../reducers";

import IconWithTooltip from "ui/components/shared/IconWithTooltip";
import MaterialIcon from "ui/components/shared/MaterialIcon";
import { UIState } from "ui/state";
import { isDemo } from "ui/utils/environment";

// TODO [ryanjduffy]: Refactor shared styling more completely
import { trackEvent } from "ui/utils/telemetry";
import { PrimaryPanelName } from "ui/state/layout";
import classNames from "classnames";

function ToolbarButtonTab({ active }: { active: boolean }) {
  return (
    <div
      className={classnames("h-full w-1 bg-primaryAccent absolute left-0", {
        invisible: !active,
      })}
      style={{ borderRadius: "0 4px 4px 0" }}
    />
  );
}
function ToolbarButton({
  icon,
  label,
  name,
}: {
  icon: string;
  label: string;
  name: PrimaryPanelName;
}) {
  const isPaused = useSelector(selectors.hasFrames);
  const selectedPrimaryPanel = useSelector(selectors.getSelectedPrimaryPanel);
  const panelCollapsed = useSelector(selectors.getPaneCollapse);
  const dispatch = useDispatch();

  const onClick = (panelName: PrimaryPanelName) => {
    if (panelCollapsed || (selectedPrimaryPanel == panelName && !panelCollapsed)) {
      trackEvent(`toolbox.toggle_sidebar`);
      dispatch(actions.togglePaneCollapse());
    }

    if (selectedPrimaryPanel != panelName) {
      trackEvent(`toolbox.primary.${panelName}_select`);
      dispatch(actions.setSelectedPrimaryPanel(panelName));
    }
  };

  return (
    <div className="px-2 relative">
      <ToolbarButtonTab active={selectedPrimaryPanel == name} />
      <div
        className={classnames("toolbar-panel-button", name, {
          active: selectedPrimaryPanel == name,
          paused: isPaused,
        })}
      >
        <IconWithTooltip
          icon={
            <MaterialIcon className={classNames("toolbar-panel-icon", name)} iconSize="2xl">
              {icon}
            </MaterialIcon>
          }
          content={label}
          handleClick={() => onClick(name)}
        />
      </div>
      {isPaused && name == "debug" ? (
        <div className="absolute bg-secondaryAccent top-1 left-3 rounded-full h-2 w-2 mr-2 mb-1 border-1.5 border-toolbarBackground" />
      ) : null}
    </div>
  );
}

function Toolbar({ viewMode }: PropsFromRedux) {
  if (isDemo()) {
    return <div></div>;
  }

  return (
    <div className="toolbox-toolbar-container flex flex-col items-center justify-between py-1">
      <div id="toolbox-toolbar space-y-1">
        <ToolbarButton icon="forum" label="Comments" name="comments" />
        <ToolbarButton icon="list" label="Events" name="events" />
        {viewMode == "dev" ? (
          <>
            <ToolbarButton icon="description" name="explorer" label="Source Explorer" />
            <ToolbarButton icon="search" name="search" label="Search" />
            <ToolbarButton icon="motion_photos_paused" name="debug" label="Pause Information" />
          </>
        ) : null}
      </div>
    </div>
  );
}

const connector = connect((state: UIState) => ({
  viewMode: selectors.getViewMode(state),
}));
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Toolbar);

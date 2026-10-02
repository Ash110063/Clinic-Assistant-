"use client";

import { ProtoProvider, useProto } from "./store";
import { PresenterMenu } from "./shell";
import { HomeScreen } from "./screen-home";
import { IntakeChatScreen, IntakeDoneScreen, IntakeWelcomeScreen } from "./screen-intake";
import { IntakeDetailsScreen } from "./screen-details";
import { QueueScreen } from "./screen-queue";
import { BriefScreen } from "./screen-brief";
import { InsightsScreen, SignedScreen } from "./screen-doctor-end";

function Router() {
  const { screen } = useProto();
  switch (screen) {
    case "home":
      return <HomeScreen />;
    case "intake-welcome":
      return <IntakeWelcomeScreen />;
    case "intake-details":
      return <IntakeDetailsScreen />;
    case "intake-chat":
      return <IntakeChatScreen />;
    case "intake-done":
      return <IntakeDoneScreen />;
    case "queue":
      return <QueueScreen />;
    case "brief":
      return <BriefScreen />;
    case "signed":
      return <SignedScreen />;
    case "insights":
      return <InsightsScreen />;
  }
}

export function Prototype() {
  return (
    <ProtoProvider>
      <Router />
      <PresenterMenu />
    </ProtoProvider>
  );
}

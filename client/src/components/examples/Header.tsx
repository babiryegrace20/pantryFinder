import { Header } from "../Header";

export default function HeaderExample() {
  return (
    <div className="space-y-4">
      <Header
        onGetHelp={() => console.log("Get help clicked")}
        onSignIn={() => console.log("Sign in clicked")}
      />
      <Header
        currentUser={{ name: "Jane Doe", role: "individual" }}
        onGetHelp={() => console.log("Get help clicked")}
      />
      <Header
        currentUser={{ name: "John Smith", role: "pantry-admin" }}
        onGetHelp={() => console.log("Get help clicked")}
      />
    </div>
  );
}

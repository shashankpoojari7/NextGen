import { Container } from "@/app/(app)/Container";
import MessageBar from "@/components/message/MessageBar";
import SideBar from "@/components/sidebar/SideBar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SideBar/>
        <Container>
          {children}
        </Container>
      {/* <MessageBar/> */}
    </div>
  );
}

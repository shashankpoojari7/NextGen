import { Container } from "@/app/(app)/Container";
import BottomBar from "@/components/sidebar/BottomBar";
import SideBar from "@/components/sidebar/SideBar";
import MobileHomeTopBar from "@/components/home/MobileHomeTopBar";
import MobileProfileTopBar from "@/components/home/MobileProfileTopBar";
import AuthProvider from "./AuthProvider";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <AuthProvider>
      <SideBar/>
      <MobileHomeTopBar/>
      <MobileProfileTopBar/>
      <Container>
        {children}
      </Container>
      <BottomBar/>
    </AuthProvider>
  );
}

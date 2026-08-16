import Navbar from "@/components/Navbar";
import Landing from "./(nondashboard)/landing/page";
import { NAVBAR_HEIGHT } from "@/lib/constants";

export default function Home() {
  return (
    <div className='h-full w-full'>
      <Navbar />
      <main className={`h-full w-full flex flex-col`} style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        <Landing/>
      </main>
    </div>
  );
}

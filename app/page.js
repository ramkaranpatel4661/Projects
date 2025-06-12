import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserButton } from "@stackframe/stack"; // ✅ only once

export default function Home() {
  return (
    <div>
      <h1>this is my first project</h1>
      <Button variant={'destructive'}>clickme</Button>
      <UserButton />
    </div>
  );
}

import { auth } from "@/lib/auth";

const Test1 = async () => {
  const data = await auth();
  return (
    <pre className="p-6 text-xs">Session: {JSON.stringify(data, null, 2)}</pre>
  );
};

export default Test1;

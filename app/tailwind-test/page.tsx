export default function TailwindTest() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-red-500 text-white p-8 text-center rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Tailwind Test</h1>
        <p className="text-lg">If you see this text in a red box with white text, Tailwind is working!</p>
      </div>
      
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-blue-500 p-4 text-white text-center rounded">Blue Box</div>
        <div className="bg-green-500 p-4 text-white text-center rounded">Green Box</div>
        <div className="bg-yellow-500 p-4 text-black text-center rounded">Yellow Box</div>
      </div>
    </div>
  );
} 
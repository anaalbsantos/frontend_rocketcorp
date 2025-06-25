import { Sparkles } from "lucide-react";

interface InsightBoxProps {
  children: React.ReactNode;
}

const InsightBox = ({ children }: InsightBoxProps) => {
  return (
    <div className="bg-[#F5F5F5] border-l-4 border-brand p-4 flex items-start gap-2 rounded-md">
      <Sparkles className="text-brand w-4 h-4 mt-1" />
      <div className="text-sm text-gray-700">
        <p className="font-semibold">Insights</p>
        <p>{children}</p>
      </div>
    </div>
  );
};

export default InsightBox;

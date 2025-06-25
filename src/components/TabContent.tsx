import React from "react";

interface TabsContentProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  tabs: string[];
  contentByTab?: Record<string, React.ReactNode>;
  itemClasses?: Record<string, string>;
  className?: string;
}

const TabsContent: React.FC<TabsContentProps> = ({
  activeTab,
  onChangeTab,
  tabs,
  contentByTab,
  itemClasses,
  className = "",
}) => (
  <>
    <div className={`flex px-4 ${className}`}>
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`cursor-pointer text-lg font-medium transition duration-150 ease-in-out ml-4 px-10 py-3 ${
            activeTab === tab
              ? "border-b-2 border-[#08605f] text-[#08605f]"
              : "text-gray-500 hover:text-gray-700"
          } ${itemClasses?.[tab] || ""}`}
          onClick={() => onChangeTab(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </div>
      ))}
    </div>
    {contentByTab && <div className="px-4 py-6">{contentByTab[activeTab]}</div>}
  </>
);

export default TabsContent;

import React, { useState } from 'react';
import { StoreSettings, ShiftSettings, ResetSchedule, ChangePassword, ResetEmployeePassword } from '@/components/dashboard/Molecules/settings';
import { tabs } from '@/commons';

const tabComponents = {
    store: <StoreSettings />,
    shifts: <ShiftSettings />,
    reset: <ResetSchedule />,
    'change-password': <ChangePassword />,
    'reset-password': <ResetEmployeePassword />,
};

const SettingsPanel = () => {
    const [activeTab, setActiveTab] = useState('store');

    return (
        <div>
            <div className="flex space-x-2 border-b mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 rounded-t-md transition-all ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 font-semibold bg-blue-50'
                            : 'border-transparent text-gray-500 hover:text-blue-500 hover:bg-gray-100'
                            }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>


            <div className="bg-white p-6 rounded-xl shadow-md">
                {tabComponents[activeTab]}
            </div>
        </div>
    );
};

export default SettingsPanel;

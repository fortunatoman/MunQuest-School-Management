import React from 'react';

interface Step {
  id: string;
  name: string;
}

interface OrganiserNavigationProps {
  steps: Step[];
  activeStep: string;
  onStepChange: (step: string) => void;
}

const OrganiserNavigation: React.FC<OrganiserNavigationProps> = ({
  steps,
  activeStep,
  onStepChange
}) => {
  return (
    <div className="flex items-center space-x-2">
      {steps.map((step) => (
        <button
          key={step.id}
          onClick={() => onStepChange(step.id)}
          className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm font-medium rounded-[20px] transition-colors duration-200 ${
            activeStep === step.id
              ? 'bg-[#395579] text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {step.name}
        </button>
      ))}
    </div>
  );
};

export default OrganiserNavigation;

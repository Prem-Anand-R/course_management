import React from 'react';

const ProgressIndicator = ({ currentStep, steps, onStepClick, completionPercentage }) => {
  return (
    <div className="mb-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm text-gray-500">{completionPercentage}% complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Step Navigation */}
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => onStepClick(step.id)}
                  className={`relative w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                    currentStep === step.id
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : currentStep > step.id
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                  } hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {currentStep > step.id ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </button>
                <div className="ml-4 min-w-0">
                  <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {step.name}
                  </p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
              {stepIdx !== steps.length - 1 && (
                <div className="hidden sm:block absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default ProgressIndicator;

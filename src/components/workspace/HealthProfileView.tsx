import React, { useState, useEffect } from 'react';
import { 
  User, 
  Heart, 
  Activity, 
  Moon, 
  ShieldCheck, 
  Pill, 
  AlertCircle, 
  Save, 
  Check, 
  Plus, 
  Trash2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { initialHealthProfile } from '../../data/mockHealthData';
import { HealthProfile } from '../../types';
import { useHealthData } from '../../context/HealthDataContext';

const defaultEmptyProfile: HealthProfile = {
  personal: {
    fullName: '',
    age: 35,
    sex: 'Male',
    heightCm: 175,
    weightKg: 70,
    bloodType: 'O+',
    bpSystolic: 120,
    bpDiastolic: 80,
    restingHeartRate: 72,
  },
  lifestyle: {
    smokingStatus: 'Never',
    alcoholUnitsPerWeek: 2,
    activityLevel: 'Moderately Active',
    sleepHoursPerNight: 7,
    dietaryPattern: 'Balanced',
  },
  medicalHistory: {
    diagnosedConditions: [],
    familyHistory: [],
    medications: [],
    allergies: [],
  }
};

export const HealthProfileView: React.FC = () => {
  const { userProfile, updateProfile, loadDevFixture, isDevFixtureLoaded } = useHealthData();
  const [profile, setProfile] = useState<HealthProfile>(userProfile || defaultEmptyProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    }
  }, [userProfile]);

  const bmi = (profile.personal.weightKg / Math.pow(profile.personal.heightCm / 100, 2)).toFixed(1);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setProfile({
        ...profile,
        medicalHistory: {
          ...profile.medicalHistory,
          diagnosedConditions: [...profile.medicalHistory.diagnosedConditions, newCondition.trim()]
        }
      });
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    const updated = [...profile.medicalHistory.diagnosedConditions];
    updated.splice(index, 1);
    setProfile({
      ...profile,
      medicalHistory: { ...profile.medicalHistory, diagnosedConditions: updated }
    });
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setProfile({
        ...profile,
        medicalHistory: {
          ...profile.medicalHistory,
          allergies: [...profile.medicalHistory.allergies, newAllergy.trim()]
        }
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    const updated = [...profile.medicalHistory.allergies];
    updated.splice(index, 1);
    setProfile({
      ...profile,
      medicalHistory: { ...profile.medicalHistory, allergies: updated }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
                PATIENT RECORD
              </span>
              <span className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">&bull; Explicit Data Vault</span>
            </div>
            <h2 className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
              Personal Health Dossier
            </h2>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
              Explicitly provided by you. SAAHAJ never infers or fabricates sensitive biometric details.
            </p>
          </div>

          <button
            type="submit"
            id="save-profile-btn"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] dark:bg-[#EAE5DD] hover:bg-[#2A2A2A] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#1A1A1A] dark:border-[#EAE5DD] self-start sm:self-center"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Profile Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Dossier</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Biometrics & Baseline Vitals */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D]">
          1. Biometrics & Baseline Vitals
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              value={profile.personal.fullName}
              onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, fullName: e.target.value } })}
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-editorial text-lg italic text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mb-1">
              Age (Years)
            </label>
            <input
              type="number"
              value={profile.personal.age}
              onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, age: parseInt(e.target.value) || 0 } })}
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono-code text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mb-1">
              Biological Sex
            </label>
            <select
              value={profile.personal.sex}
              onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, sex: e.target.value as any } })}
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mb-1">
              Blood Group
            </label>
            <input
              type="text"
              value={profile.personal.bloodType}
              onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, bloodType: e.target.value } })}
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono-code text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              value={profile.personal.heightCm}
              onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, heightCm: parseFloat(e.target.value) || 0 } })}
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono-code text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={profile.personal.weightKg}
              onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, weightKg: parseFloat(e.target.value) || 0 } })}
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono-code text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mb-1">
              Computed BMI
            </label>
            <div className="px-3 py-2 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-mono-code font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
              {bmi} kg/m²
            </div>
          </div>

          <div>
            <label className="block text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mb-1">
              Blood Pressure (Systolic / Diastolic)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={profile.personal.bpSystolic}
                onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, bpSystolic: parseInt(e.target.value) || 0 } })}
                className="w-1/2 px-2 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono-code text-[#1A1A1A] dark:text-[#EAE5DD] text-center focus:outline-none"
              />
              <span className="text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40">/</span>
              <input
                type="number"
                value={profile.personal.bpDiastolic}
                onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, bpDiastolic: parseInt(e.target.value) || 0 } })}
                className="w-1/2 px-2 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono-code text-[#1A1A1A] dark:text-[#EAE5DD] text-center focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Lifestyle & Daily Habits */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D]">
          2. Lifestyle & Daily Habits
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mb-1">
              Physical Activity Level
            </label>
            <select
              value={profile.lifestyle.activityLevel}
              onChange={(e) => setProfile({ ...profile, lifestyle: { ...profile.lifestyle, activityLevel: e.target.value as any } })}
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            >
              <option value="Sedentary">Sedentary (&lt; 3,000 steps/day)</option>
              <option value="Lightly Active">Lightly Active (3,000–6,000 steps/day)</option>
              <option value="Moderately Active">Moderately Active (6,000–10,000 steps/day)</option>
              <option value="Very Active">Very Active (&gt; 10,000 steps/day or heavy training)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mb-1">
              Average Sleep Duration
            </label>
            <input
              type="number"
              step="0.5"
              value={profile.lifestyle.sleepHoursPerNight}
              onChange={(e) => setProfile({ ...profile, lifestyle: { ...profile.lifestyle, sleepHoursPerNight: parseFloat(e.target.value) || 0 } })}
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono-code text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mb-1">
              Dietary Pattern
            </label>
            <select
              value={profile.lifestyle.dietaryPattern}
              onChange={(e) => setProfile({ ...profile, lifestyle: { ...profile.lifestyle, dietaryPattern: e.target.value as any } })}
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            >
              <option value="Balanced">Balanced / Whole Foods</option>
              <option value="Mediterranean">Mediterranean Pattern</option>
              <option value="Vegetarian">Vegetarian / Plant-Forward</option>
              <option value="Low Carb / Keto">Low Carbohydrate</option>
              <option value="High Sodium / Processed">High Sodium / Standard Convenience</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mb-1">
              Smoking Status
            </label>
            <select
              value={profile.lifestyle.smokingStatus}
              onChange={(e) => setProfile({ ...profile, lifestyle: { ...profile.lifestyle, smokingStatus: e.target.value as any } })}
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            >
              <option value="Never">Never Smoked</option>
              <option value="Former">Former Smoker (Quit &gt; 1 year)</option>
              <option value="Occasional">Occasional</option>
              <option value="Current">Current Smoker</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mb-1">
              Alcohol Consumption (Units/Week)
            </label>
            <input
              type="number"
              value={profile.lifestyle.alcoholUnitsPerWeek}
              onChange={(e) => setProfile({ ...profile, lifestyle: { ...profile.lifestyle, alcoholUnitsPerWeek: parseInt(e.target.value) || 0 } })}
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono-code text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Diagnosed Conditions & Allergies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Conditions */}
        <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center justify-between">
            <span>Known Diagnoses</span>
            <span className="text-[10px] text-[#A38D7D] font-mono-code">Explicitly logged</span>
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              placeholder="e.g. Mild Hypertension..."
              className="flex-1 px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-newsreader italic text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            />
            <button
              type="button"
              onClick={addCondition}
              className="p-2.5 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] hover:bg-[#2A2A2A] text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {profile.medicalHistory.diagnosedConditions.map((cond, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-newsreader italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                <span>{cond}</span>
                <button type="button" onClick={() => removeCondition(idx)} className="text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40 hover:text-[#A38D7D] cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center justify-between">
            <span>Allergies & Sensitivities</span>
            <span className="text-[10px] text-[#A38D7D] font-mono-code">Clinical Safety</span>
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              placeholder="e.g. Penicillin..."
              className="flex-1 px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-newsreader italic text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            />
            <button
              type="button"
              onClick={addAllergy}
              className="p-2.5 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] hover:bg-[#2A2A2A] text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {profile.medicalHistory.allergies.map((all, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-newsreader italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                <span>{all}</span>
                <button type="button" onClick={() => removeAllergy(idx)} className="text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40 hover:text-[#A38D7D] cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </form>
  );
};

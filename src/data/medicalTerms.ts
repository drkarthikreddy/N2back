import { MedicalWord, MedicalWordInfo } from '../types/game';

export const MEDICAL_WORDS: MedicalWord[] = [
  'tb',
  'cml',
  'aids',
  'mi',
  'angina',
  'typhoid',
  'dengue',
  'mumps',
  'rabies'
];

export const MEDICAL_DICTIONARY: Record<MedicalWord, MedicalWordInfo> = {
  tb: {
    id: 'tb',
    display: 'TB',
    fullName: 'Tuberculosis',
    category: 'Infectious',
    phonetic: 'T B',
    overview: 'Mycobacterium tuberculosis infection primarily affecting the pulmonary parenchyma, characterized by caseating granulomas and acid-fast bacilli.',
    symptoms: ['Chronic cough with hemoptysis', 'Night sweats', 'Weight loss / cachexia', 'Low-grade fever']
  },
  cml: {
    id: 'cml',
    display: 'CML',
    fullName: 'Chronic Myelogenous Leukemia',
    category: 'Oncology / Hematology',
    phonetic: 'C M L',
    overview: 'Myeloproliferative neoplasm driven by the BCR-ABL1 fusion gene resulting from the reciprocal t(9;22) Philadelphia chromosome translocation.',
    symptoms: ['Massive splenomegaly', 'Fatigue and anemia', 'Hyperleukocytosis', 'Early satiety']
  },
  aids: {
    id: 'aids',
    display: 'AIDS',
    fullName: 'Acquired Immunodeficiency Syndrome',
    category: 'Infectious',
    phonetic: 'AIDS',
    overview: 'Advanced stage of Human Immunodeficiency Virus (HIV) infection marked by profound CD4+ T-cell depletion (<200 cells/μL) and opportunistic infections.',
    symptoms: ['Pneumocystis jirovecii pneumonia', 'Kaposi sarcoma', 'Severe candidiasis', 'Persistent lymphadenopathy']
  },
  mi: {
    id: 'mi',
    display: 'MI',
    fullName: 'Myocardial Infarction',
    category: 'Cardiology',
    phonetic: 'M I',
    overview: 'Acute ischemic necrosis of myocardial tissue usually caused by rupture of an atherosclerotic coronary plaque and acute thrombotic occlusion.',
    symptoms: ['Crushing substernal chest pressure', 'Radiation to left jaw / arm', 'Diaphoresis', 'Troponin elevation']
  },
  angina: {
    id: 'angina',
    display: 'Angina',
    fullName: 'Angina Pectoris',
    category: 'Cardiology',
    phonetic: 'Angina',
    overview: 'Transient chest discomfort caused by myocardial ischemia without myocyte necrosis, typically provoked by physical exertion or emotional stress.',
    symptoms: ['Exertional chest tightness', 'Prompt relief with rest / sublingual nitroglycerin', 'Shortness of breath', 'Levine sign']
  },
  typhoid: {
    id: 'typhoid',
    display: 'Typhoid',
    fullName: 'Typhoid Fever (Enteric Fever)',
    category: 'Infectious',
    phonetic: 'Typhoid',
    overview: 'Systemic febrile illness caused by Salmonella enterica serovar Typhi, acquired via contaminated water or food in endemic regions.',
    symptoms: ['Step-ladder fever pattern', 'Rose spots on trunk', 'Relative bradycardia (Faget sign)', 'Hepatosplenomegaly']
  },
  dengue: {
    id: 'dengue',
    display: 'Dengue',
    fullName: 'Dengue Fever ("Breakbone Fever")',
    category: 'Infectious',
    phonetic: 'Dengue',
    overview: 'Mosquito-borne flavivirus infection transmitted by Aedes aegypti, with risk of progression to severe dengue with plasma leakage and shock.',
    symptoms: ['Severe retro-orbital pain', 'High saddleback fever', 'Intense myalgias/arthralgias', 'Thrombocytopenia']
  },
  mumps: {
    id: 'mumps',
    display: 'Mumps',
    fullName: 'Mumps (Epidemic Parotitis)',
    category: 'Infectious',
    phonetic: 'Mumps',
    overview: 'Acute contagious paramyxovirus infection manifesting with tender enlargement of salivary glands, notably the parotid glands.',
    symptoms: ['Bilateral parotid gland swelling', 'Chewing pain / trismus', 'Orchitis (post-pubertal males)', 'Aseptic meningitis risk']
  },
  rabies: {
    id: 'rabies',
    display: 'Rabies',
    fullName: 'Rabies Encephalitis',
    category: 'Infectious',
    phonetic: 'Rabies',
    overview: 'Fatal neurotropic rhabdovirus causing acute encephalomyelitis transmitted via animal bites (saliva); nearly 100% fatal once clinical signs appear.',
    symptoms: ['Hydrophobia and aerophobia', 'Agitation and delirium', 'Paresthesia at bite site', 'Autonomic instability']
  }
};

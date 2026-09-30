import { MedicalWord, MedicalWordInfo } from '../types/game';

export const MEDICAL_WORDS: MedicalWord[] = [
  'stroke',
  'asthma',
  'aids',
  'syphilis',
  'angina',
  'typhoid',
  'dengue',
  'mumps',
  'rabies'
];

export const MEDICAL_DICTIONARY: Record<MedicalWord, MedicalWordInfo> = {
  stroke: {
    id: 'stroke',
    display: 'Stroke',
    fullName: 'Cerebrovascular Accident (Stroke)',
    category: 'Neurology / Vascular',
    phonetic: 'Stroke',
    overview: 'Acute focal neurological deficit caused by cerebrovascular occlusion (ischemic) or intracranial hemorrhage.',
    symptoms: ['Facial droop', 'Unilateral arm weakness', 'Dysarthria / slurred speech', 'Acute visual disturbance']
  },
  asthma: {
    id: 'asthma',
    display: 'Asthma',
    fullName: 'Bronchial Asthma',
    category: 'Pulmonology',
    phonetic: 'Asthma',
    overview: 'Chronic inflammatory airway disease characterized by bronchial hyperresponsiveness and reversible airflow limitation.',
    symptoms: ['Expiratory wheezing', 'Shortness of breath', 'Nocturnal cough', 'Chest tightness']
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
  syphilis: {
    id: 'syphilis',
    display: 'Syphilis',
    fullName: 'Syphilis (Treponema pallidum)',
    category: 'Infectious',
    phonetic: 'Syphilis',
    overview: 'Multi-stage systemic infection caused by Treponema pallidum, beginning with an indurated painless chancre followed by disseminated secondary and tertiary sequelae.',
    symptoms: ['Painless genital chancre', 'Copper-colored rash on palms/soles', 'Condylomata lata', 'Argyll Robertson pupils']
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

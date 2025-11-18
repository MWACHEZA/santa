import React, { useState } from 'react';
import { Cross, Heart, Crown, Church, BookOpen, Droplets } from 'lucide-react';
import './Sacraments.css';

interface Sacrament {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  requirements: string[];
  preparation: string;
  questions: { question: string; answer: string }[];
}

const Sacraments: React.FC = () => {
  const [activeSacrament, setActiveSacrament] = useState<string>('baptism');

  const sacraments: Sacrament[] = [
    {
      id: 'baptism',
      name: 'Baptism',
      icon: <Droplets size={32} />,
      description: 'The first sacrament of initiation, washing away original sin and welcoming new members into the Church.',
      requirements: [
        'Birth certificate',
        'Parents\' marriage certificate (if applicable)',
        'Godparents must be confirmed Catholics',
        'Baptismal preparation class attendance'
      ],
      preparation: 'One preparation class required for parents and godparents. Classes held monthly.',
      questions: [
        {
          question: 'What is Baptism?',
          answer: 'Baptism is the first sacrament of initiation that cleanses us from original sin and makes us children of God and members of the Church.'
        },
        {
          question: 'Who can be baptized?',
          answer: 'Anyone who has not been baptized can receive this sacrament. For infants, parents make the decision. Adults must freely choose baptism.'
        },
        {
          question: 'What are the requirements for godparents?',
          answer: 'Godparents must be confirmed Catholics, at least 16 years old, and living a life consistent with Catholic teaching.'
        }
      ]
    },
    {
      id: 'confirmation',
      name: 'Confirmation',
      icon: <Crown size={32} />,
      description: 'The sacrament that completes baptismal grace and strengthens us with the gifts of the Holy Spirit.',
      requirements: [
        'Must be baptized Catholic',
        'Minimum age of 14 years',
        'Two years of preparation classes',
        'Active participation in parish life',
        'Confirmation sponsor (confirmed Catholic)'
      ],
      preparation: 'Two-year preparation program including catechesis, service projects, and spiritual formation.',
      questions: [
        {
          question: 'What is Confirmation?',
          answer: 'Confirmation is the sacrament that completes baptismal grace and gives us the fullness of the Holy Spirit to live as mature Christians.'
        },
        {
          question: 'What are the seven gifts of the Holy Spirit?',
          answer: 'Wisdom, Understanding, Counsel, Fortitude, Knowledge, Piety, and Fear of the Lord.'
        },
        {
          question: 'Can adults receive Confirmation?',
          answer: 'Yes, adults who were baptized but not confirmed can receive this sacrament after proper preparation.'
        }
      ]
    },
    {
      id: 'eucharist',
      name: 'Holy Eucharist',
      icon: <Church size={32} />,
      description: 'The source and summit of Christian life, receiving the Body and Blood of Christ.',
      requirements: [
        'Must be baptized Catholic',
        'Reached age of reason (usually 7-8 years)',
        'First Communion preparation classes',
        'Understanding of the Eucharist',
        'State of grace (free from mortal sin)'
      ],
      preparation: 'One-year preparation program including catechesis and practice for the ceremony.',
      questions: [
        {
          question: 'What is the Eucharist?',
          answer: 'The Eucharist is the true Body and Blood of Jesus Christ under the appearances of bread and wine.'
        },
        {
          question: 'How often should Catholics receive Communion?',
          answer: 'Catholics are encouraged to receive Communion at every Mass they attend, provided they are in a state of grace.'
        },
        {
          question: 'What is required before receiving Communion?',
          answer: 'One must be free from mortal sin, fast for one hour before receiving (except water and medicine), and believe in the Real Presence.'
        }
      ]
    },
    {
      id: 'reconciliation',
      name: 'Reconciliation (Confession)',
      icon: <Heart size={32} />,
      description: 'The sacrament of God\'s mercy and forgiveness for sins committed after baptism.',
      requirements: [
        'Must be baptized Catholic',
        'Reached age of reason',
        'Examination of conscience',
        'Genuine sorrow for sins',
        'Firm purpose of amendment'
      ],
      preparation: 'First Confession preparation is part of First Communion program. Ongoing formation through parish programs.',
      questions: [
        {
          question: 'What is Confession?',
          answer: 'Confession is the sacrament where we confess our sins to a priest and receive God\'s forgiveness through absolution.'
        },
        {
          question: 'How often should I go to Confession?',
          answer: 'Catholics must confess mortal sins before receiving Communion. Regular confession (monthly) is recommended for spiritual growth.'
        },
        {
          question: 'What are the steps of a good Confession?',
          answer: 'Examination of conscience, genuine sorrow, confession of sins, receiving absolution, and doing the assigned penance.'
        }
      ]
    },
    {
      id: 'anointing',
      name: 'Anointing of the Sick',
      icon: <Cross size={32} />,
      description: 'The sacrament of healing for those who are seriously ill, elderly, or facing surgery.',
      requirements: [
        'Must be baptized Catholic',
        'Serious illness, old age, or major surgery',
        'Conscious and able to receive (preferred)',
        'Request from patient or family'
      ],
      preparation: 'No formal preparation required. Contact parish priest immediately when needed.',
      questions: [
        {
          question: 'Who can receive Anointing of the Sick?',
          answer: 'Any Catholic who is seriously ill, elderly and frail, or about to undergo major surgery can receive this sacrament.'
        },
        {
          question: 'Is this sacrament only for the dying?',
          answer: 'No, it\'s for anyone facing serious illness. It can be received multiple times during different illnesses.'
        },
        {
          question: 'What are the effects of this sacrament?',
          answer: 'Spiritual healing, strength to bear illness, forgiveness of sins, and sometimes physical healing if it\'s God\'s will.'
        }
      ]
    },
    {
      id: 'marriage',
      name: 'Marriage',
      icon: <Heart size={32} />,
      description: 'The sacrament uniting a man and woman in a lifelong covenant of love, mirroring Christ\'s love for the Church.',
      requirements: [
        'Both parties must be free to marry',
        'At least one party must be Catholic',
        'Pre-marriage investigation',
        'Marriage preparation program',
        'Banns of marriage published'
      ],
      preparation: 'Six-month preparation program including Pre-Cana classes, natural family planning, and spiritual direction.',
      questions: [
        {
          question: 'What makes a Catholic marriage valid?',
          answer: 'Free consent of both parties, proper form (Catholic ceremony), and no impediments to marriage.'
        },
        {
          question: 'Can Catholics marry non-Catholics?',
          answer: 'Yes, with proper dispensation and preparation. The Catholic party must promise to raise children Catholic.'
        },
        {
          question: 'What is the purpose of Catholic marriage?',
          answer: 'The mutual sanctification of the spouses and the procreation and education of children.'
        }
      ]
    },
    {
      id: 'holy-orders',
      name: 'Holy Orders',
      icon: <BookOpen size={32} />,
      description: 'The sacrament by which men are ordained as deacons, priests, or bishops to serve the Church.',
      requirements: [
        'Must be baptized and confirmed Catholic man',
        'Called by God to priesthood',
        'Seminary formation and education',
        'Celibacy commitment (Latin rite)',
        'Bishop\'s approval'
      ],
      preparation: 'Years of seminary formation including philosophy, theology, pastoral training, and spiritual formation.',
      questions: [
        {
          question: 'What are the three degrees of Holy Orders?',
          answer: 'Deacon, Priest (Presbyter), and Bishop. Each has specific roles and responsibilities in the Church.'
        },
        {
          question: 'Can married men become priests?',
          answer: 'In the Latin rite, priests must be celibate. In Eastern Catholic rites, married men can be ordained as priests.'
        },
        {
          question: 'How does one discern a call to priesthood?',
          answer: 'Through prayer, spiritual direction, involvement in parish life, and consultation with priests and vocations director.'
        }
      ]
    }
  ];

  const currentSacrament = sacraments.find(s => s.id === activeSacrament) || sacraments[0];

  return (
    <div className="sacraments section-padding">
      <div className="container">
        <div className="sacraments-header">
          <h1 className="text-center mb-4">The Seven Sacraments</h1>
          <p className="text-center mb-5">
            The sacraments are outward signs of inward grace, instituted by Christ for our sanctification.
          </p>
        </div>

        {/* Sacrament Navigation */}
        <div className="sacrament-nav">
          {sacraments.map((sacrament) => (
            <button
              key={sacrament.id}
              className={`sacrament-tab ${activeSacrament === sacrament.id ? 'active' : ''}`}
              onClick={() => setActiveSacrament(sacrament.id)}
            >
              {sacrament.icon}
              <span>{sacrament.name}</span>
            </button>
          ))}
        </div>

        {/* Sacrament Details */}
        <div className="sacrament-details">
          <div className="sacrament-overview card">
            <div className="sacrament-header">
              {currentSacrament.icon}
              <h2>{currentSacrament.name}</h2>
            </div>
            <p className="sacrament-description">{currentSacrament.description}</p>
            
            <div className="sacrament-info-grid">
              <div className="info-section">
                <h3>Requirements</h3>
                <ul>
                  {currentSacrament.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              
              <div className="info-section">
                <h3>Preparation</h3>
                <p>{currentSacrament.preparation}</p>
              </div>
            </div>
          </div>

          {/* Questions and Answers */}
          <div className="qa-section">
            <h3>Frequently Asked Questions</h3>
            <div className="qa-grid">
              {currentSacrament.questions.map((qa, index) => (
                <div key={index} className="qa-item card">
                  <h4 className="question">{qa.question}</h4>
                  <p className="answer">{qa.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-info card">
            <h3>Need More Information?</h3>
            <p>
              For more details about any sacrament or to schedule preparation classes, 
              please contact the parish office or speak with one of our priests after Mass.
            </p>
            <div className="contact-details">
              <p><strong>Parish Office:</strong> +263 9 123456</p>
              <p><strong>Email:</strong> info@stpatricksmakokoba.org</p>
              <p><strong>Office Hours:</strong> Monday-Friday 8:00 AM - 4:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sacraments;

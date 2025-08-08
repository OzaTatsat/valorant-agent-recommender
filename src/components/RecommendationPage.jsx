import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AudioController from './AudioController';

const RecommendationPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Fix: Use useMemo to prevent new array creation on every render
  const selectedAgents = useMemo(() => {
    return state?.selectedAgents || [];
  }, [state?.selectedAgents]);
  
  const [allAgents, setAllAgents] = useState([]);
  const [recommendedAgent, setRecommendedAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if no agents selected
    if (selectedAgents.length === 0) {
      navigate('/');
      return;
    }

    // Move fetchAndRecommend INSIDE useEffect to fix ESLint warning
    const fetchAndRecommend = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.data) {
          throw new Error('Invalid data structure received');
        }
        
        const agents = data.data;
        setAllAgents(agents);

        // Enhanced recommendation algorithm
        const recommendAgent = () => {
          const pool = [];
          
          agents.forEach(agent => {
            const isMainAgent = selectedAgents.includes(agent.uuid);
            
            if (!isMainAgent) {
              // Non-main agents get higher probability (3x weight)
              pool.push(agent, agent, agent);
            } else {
              // Main agents get minimal probability (1x weight)
              pool.push(agent);
            }
          });

          // Shuffle the pool and select
          const shuffledPool = pool.sort(() => 0.5 - Math.random());
          const uniqueAgents = [...new Set(shuffledPool.map(a => a.uuid))]
            .map(uuid => agents.find(a => a.uuid === uuid))
            .filter(Boolean);

          return uniqueAgents[0] || agents[Math.floor(Math.random() * agents.length)];
        };

        const recommended = recommendAgent();
        setRecommendedAgent(recommended);
        
      } catch (error) {
        console.error('Error fetching recommendation:', error);
        setError('Failed to load recommendation. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Call the function
    fetchAndRecommend();
  }, [selectedAgents, navigate]); // Now selectedAgents is stable

  const handleBack = () => {
    navigate('/');
  };

  const handleReroll = () => {
    if (allAgents.length === 0) return;
    
    setLoading(true);
    
    // Add some suspense with timeout
    setTimeout(() => {
      const nonMainAgents = allAgents.filter(agent => 
        !selectedAgents.includes(agent.uuid)
      );
      
      const pool = nonMainAgents.length > 0 ? nonMainAgents : allAgents;
      const newRecommendation = pool[Math.floor(Math.random() * pool.length)];
      
      setRecommendedAgent(newRecommendation);
      setLoading(false);
    }, 1000);
  };

  // Separate function for retry that re-fetches data
  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.data) {
        throw new Error('Invalid data structure received');
      }
      
      const agents = data.data;
      setAllAgents(agents);

      // Recommend new agent
      const nonMainAgents = agents.filter(agent => 
        !selectedAgents.includes(agent.uuid)
      );
      
      const pool = nonMainAgents.length > 0 ? nonMainAgents : agents;
      const newRecommendation = pool[Math.floor(Math.random() * pool.length)];
      
      setRecommendedAgent(newRecommendation);
      
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      setError('Failed to load recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="app-container">
        <AudioController />
        <div className="main-content">
          <div className="recommendation-container">
            <div className="loading-container">
              <div className="loading-text" style={{ color: 'var(--valorant-red)' }}>
                {error}
              </div>
              <div className="button-container" style={{ marginTop: '2rem' }}>
                <button className="secondary-button" onClick={handleBack}>
                  ← Back to Selection
                </button>
                <button className="primary-button" onClick={handleRetry}>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <AudioController />
      
      <div className="main-content">
        <div className="recommendation-container">
          <h1 className="recommendation-title">Your Recommended Agent</h1>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Analyzing your playstyle...</div>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem', 
                marginTop: '0.5rem' 
              }}>
                Finding the perfect agent for you
              </p>
            </div>
          ) : recommendedAgent ? (
            <div className="recommended-agent slide-up">
              <div className="recommended-agent-content">
                <img
                  src={recommendedAgent.fullPortrait || recommendedAgent.displayIcon}
                  alt={`${recommendedAgent.displayName} full portrait`}
                  className="agent-image"
                  style={{ 
                    maxHeight: '300px', 
                    width: 'auto',
                    marginBottom: 'var(--spacing-md)'
                  }}
                  loading="lazy"
                />
                <h2 className="agent-name" style={{ 
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--valorant-cyan)'
                }}>
                  {recommendedAgent.displayName}
                </h2>
                <p className="agent-role" style={{ 
                  fontSize: '1.2rem', 
                  marginBottom: 'var(--spacing-md)',
                  color: 'var(--text-accent)'
                }}>
                  {recommendedAgent.role?.displayName}
                </p>
                {recommendedAgent.description && (
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '1rem',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: '1.6',
                    padding: '0 var(--spacing-md)'
                  }}>
                    {recommendedAgent.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="loading-container">
              <div className="loading-text">No recommendation available</div>
            </div>
          )}

          <div className="button-container">
            <button className="secondary-button" onClick={handleBack}>
              ← Back to Selection
            </button>
            <button 
              className="primary-button" 
              onClick={handleReroll}
              disabled={loading || !recommendedAgent}
            >
              🎲 Get New Recommendation
            </button>
          </div>

          {recommendedAgent && !loading && (
            <div style={{ 
              marginTop: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              background: 'rgba(42, 52, 65, 0.5)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 70, 85, 0.2)'
            }}>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem',
                margin: 0
              }}>
                💡 This recommendation is based on your selected agents. Try different combinations for varied suggestions!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationPage;

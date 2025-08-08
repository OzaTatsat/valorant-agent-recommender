import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AudioController from './AudioController';

const MainAgentSelector = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.data) {
          setAgents(data.data);
        } else {
          throw new Error('Invalid data structure received');
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        setError('Failed to load agents. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const toggleAgentSelection = (uuid) => {
    const isSelected = selectedAgents.includes(uuid);
    
    if (isSelected) {
      setSelectedAgents(prev => prev.filter(agentId => agentId !== uuid));
    } else {
      if (selectedAgents.length >= 3) {
        alert('Maximum 3 agents can be selected! 🎯');
        return;
      }
      setSelectedAgents(prev => [...prev, uuid]);
    }
  };

  const handleRecommendClick = () => {
    if (selectedAgents.length === 0) {
      alert('Please select at least one agent to get recommendations! 🚨');
      return;
    }
    
    navigate('/recommendation', { state: { selectedAgents } });
  };

  if (loading) {
    return (
      <div className="app-container">
        <AudioController />
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading Valorant Agents...</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>
              Fetching agent data from Riot Games API
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <AudioController />
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-text" style={{ color: 'var(--valorant-red)' }}>
              {error}
            </div>
            <button 
              className="primary-button" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '1rem' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <AudioController />
      
      <div className="main-content">
        <header className="app-header">
          <h1 className="app-title">Valorant Agent Recommender</h1>
          <p className="app-subtitle">
            Select up to 3 of your main agents and discover new ones to master
          </p>
        </header>

        <div className="agent-grid">
          {agents.map((agent) => (
            <div
              key={agent.uuid}
              className={`agent-card ${selectedAgents.includes(agent.uuid) ? 'selected' : ''}`}
              onClick={() => toggleAgentSelection(agent.uuid)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleAgentSelection(agent.uuid);
                }
              }}
              aria-pressed={selectedAgents.includes(agent.uuid)}
            >
              <div className="agent-card-content">
                <img
                  src={agent.displayIcon}
                  alt={`${agent.displayName} agent icon`}
                  className="agent-image"
                  loading="lazy"
                />
                <h3 className="agent-name">{agent.displayName}</h3>
                <p className="agent-role">{agent.role?.displayName || 'Unknown'}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="button-container">
          <button 
            className="primary-button"
            onClick={handleRecommendClick}
            disabled={selectedAgents.length === 0}
          >
            Get Recommendation ({selectedAgents.length}/3)
          </button>
        </div>

        {selectedAgents.length > 0 && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: 'var(--spacing-md)',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}>
            Selected: {selectedAgents.length} of 3 agents
          </div>
        )}
      </div>
    </div>
  );
};

export default MainAgentSelector;

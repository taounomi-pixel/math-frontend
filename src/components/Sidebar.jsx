import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORIES } from '../constants/categories';

const Sidebar = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const isCategoryActive = (cat) => {
    return location.pathname.startsWith(`/c/${encodeURIComponent(cat)}`);
  };

  return (
    <div className="sidebar-container" style={{ width: '100%', marginBottom: '24px' }}>
      <div className="topics-filter" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <NavLink 
          to="/"
          className={({ isActive }) => `topic-btn ${isActive ? 'active' : ''}`}
          style={({ isActive }) => ({ 
            ...(isActive ? {} : { background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }),
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px' 
          })}
          end
        >
          <LayoutGrid size={16} />
          {t('allVideos') || '所有'}
        </NavLink>
        
        {Object.keys(CATEGORIES).map(cat => {
          const isActive = isCategoryActive(cat);
          return (
            <NavLink 
              key={cat}
              to={`/c/${encodeURIComponent(cat)}`}
              className={`topic-btn ${isActive ? 'active' : ''}`}
            >
              {t(cat) || cat}
            </NavLink>
          );
        })}
      </div>
      
      {/* Show subcategories of the active category */}
      {Object.keys(CATEGORIES).map(cat => {
        if (!isCategoryActive(cat)) return null;
        return (
          <div 
            key={`${cat}-subs`} 
            className="subtopics-filter" 
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px', 
              marginTop: '16px', 
              padding: '12px 16px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '12px',
              border: '1px dashed var(--border-color)',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            {CATEGORIES[cat].map(sub => (
              <NavLink 
                key={sub}
                to={`/c/${encodeURIComponent(cat)}/${encodeURIComponent(sub)}`}
                className={({ isActive }) => `topic-btn ${isActive ? 'active' : ''}`}
                style={{ fontSize: '13px', padding: '6px 14px' }}
                end
              >
                {t(sub) || sub}
              </NavLink>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;

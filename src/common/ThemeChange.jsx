const ThemeChange = ({ theme, toggleTheme }) => {
  return (

      <button
        onClick={toggleTheme}
        style={{
          border: '1px solid',
          padding: '6px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          color: theme === 'dark' ? '#fff' : '#000',
        }}
      >
        {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </button>
   
  );
};

export default ThemeChange;

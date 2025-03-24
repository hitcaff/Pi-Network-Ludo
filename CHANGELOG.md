# Changelog

## Version 1.0.0 (Current)

### New Features

#### Display Name Implementation
- Added user info display section in the UI
- Properly extracts and shows authenticated user's display name
- Fallback to "Player" if display name is not available
- Modern UI with hover effects and icons

#### Pool System
- Implemented 5 different pool tiers:
  - Bronze: 0.5 Pi entry, 2 Pi pool (Level 0+)
  - Silver: 1 Pi entry, 4 Pi pool (Level 5+)
  - Gold: 2 Pi entry, 8 Pi pool (Level 10+)
  - Platinum: 5 Pi entry, 20 Pi pool (Level 20+)
  - Diamond: 10 Pi entry, 40 Pi pool (Level 30+)
- Interactive slider UI for pool selection
- Mobile-friendly swipe navigation
- Level-based access restrictions
- Visual indicators for locked pools
- Detailed payout information for each pool

#### Level System
- Implemented progressive level system
  - One level increase per 5 wins
  - Persistent progress using localStorage
  - Visual level display with win count
- Level-up notifications
- Progress tracking towards next level
- Integration with pool system for eligibility checks

#### Game Logic Updates
- Added win event dispatching
- Integrated level progression with game outcomes
- Enhanced winner detection for both Ludo and Snake & Ladder games
- Added victory notifications with progress information

#### UI Improvements
- Modern, responsive design using Tailwind CSS
- Animated transitions and hover effects
- Clear visual feedback for user actions
- Mobile-optimized interface
- Improved navigation between game modes

### Technical Improvements

#### Code Organization
- Created modular update system in `updates/` directory
- Separated concerns between game logic, UI, and game systems
- Implemented event-based communication between components
- Added comprehensive documentation

#### Installation & Updates
- Added download scripts for both Windows (BAT) and Unix (SH)
- Automated repository cloning and updating
- Clear installation instructions
- Progress indicators during installation

### Documentation
- Added detailed README with feature descriptions
- Included future update roadmap
- Provided clear installation instructions
- Added technical documentation for developers

## Planned Features (v1.1)
- Enhanced user profiles
- Achievement system
- Tournament system
- Social features
- Additional game modes
- Premium cosmetics
- Team/clan system

## Installation

### Windows Users
1. Download the repository
2. Run `download-instructions.bat`
3. Follow the on-screen instructions

### Unix/Mac Users
1. Download the repository
2. Run `./download-instructions.sh`
3. Follow the on-screen instructions

## Notes
- All game progress is saved locally
- Pi Browser is required for full functionality
- Internet connection required for Pi Network integration
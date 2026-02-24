// Model
let appState = {
    events: []
};



// ========================================================



// Rendering helpers
function renderEventsTable() {
    const tbody = document.getElementById('eventsTable').querySelector('tbody')
    tbody.replaceChildren()

    for (const record of appState.events.toReversed()) {
        const row = document.createElement('tr')

        row.append(
            createDeleteButtonCell(record.id),
            createCell(record.type),
            createCell(record.timestamp)
        )

        tbody.appendChild(row)
    }
}

function renderGamesTable(games) {
    const tbody = document.getElementById('gamesTable').querySelector('tbody')
    tbody.replaceChildren()

    for (const game of games) {
        const row = document.createElement('tr')

        row.append(
            createCell(''),
            createCell(game.date),
            createCell(game.lead),
            createCell(game.kevGoals),
            createCell(game.harGoals),
            createCell(game.oppGoals),
            createCell(game.overtime)
        )

        tbody.appendChild(row)
    }
}

function renderRecentGames(games) {
    const recentGames = document.getElementById('recentGames').children
    const lastTenGames = games.slice(-10).toReversed()

    for (let i = 0; i < lastTenGames.length; i++) {

        let gameSpan = recentGames[i]
        let game = lastTenGames[i]

        gameSpan.classList.toggle('green', game.kevGoals + game.harGoals > game.oppGoals);
        gameSpan.classList.toggle('red', game.kevGoals + game.harGoals < game.oppGoals);

    }
}

function renderSessionStats(games) {
    let wins = 0;
    let overtimeWins = 0;
    let losses = 0;
    let overtimeLosses = 0;
    let leads = 0;
    let leadWins = 0;
    let blownLeads = 0;
    let comebackWins = 0;

    let kevGoals = 0;
    let harGoals = 0;
    let oppGoals = 0;

    for (const game of games) {
        if (game.lead === 1) leads++;

        if (game.win === 1) {
            wins++;
            if (game.maxTrail > 0) comebackWins++;
            if (game.lead === 1) leadWins++;
            if (game.overtime === 1) overtimeWins++;
        }

        if (game.win === 0) {
            losses++;
            if (game.maxLead > 0) blownLeads++;
            if (game.overtime === 1) overtimeLosses++;
        }
        
        kevGoals += game.kevGoals;
        harGoals += game.harGoals;
        oppGoals += game.oppGoals;
    }

    const winRate = games.length > 0 ? Math.round(wins / (wins + losses) * 100) : 0
    const overtimeWinRate = (overtimeWins + overtimeLosses) > 0 ? Math.round(overtimeWins / (overtimeWins + overtimeLosses) * 100) : 0
    const conversionRate = leads > 0 ? Math.round(leadWins / leads * 100) : 0

    const recordLabel = document.getElementById('sessionRecord')
    recordLabel.textContent = `${wins}-${losses}`

    const winRateLabel = document.getElementById('winRate')
    winRateLabel.textContent = `${winRate}%`

    const overtimeWinRateLabel = document.getElementById('overtimeRate')
    overtimeWinRateLabel.textContent = `${overtimeWinRate}%`

    const leadConversionLabel = document.getElementById('leadConversion')
    leadConversionLabel.textContent = `${conversionRate}%`

    const blownLeadsLabel = document.getElementById('blownLeads')
    blownLeadsLabel.textContent = blownLeads

    const comebackWinsLabel = document.getElementById('comebackWins')
    comebackWinsLabel.textContent = comebackWins

    const kevGoalsLabel = document.getElementById('kevGoals')
    kevGoalsLabel.textContent = kevGoals

    const harGoalsLabel = document.getElementById('harGoals')
    harGoalsLabel.textContent = harGoals

    const oppGoalsLabel = document.getElementById('oppGoals')
    oppGoalsLabel.textContent = oppGoals
}

function renderSessionSummary() {
    const games = buildGames()

    renderGamesTable(games)
    renderRecentGames(games)
    renderSessionStats(games)
}

function renderCurrentGame(game) {
    const homeScore = document.getElementById('homeScore')
    homeScore.textContent = (game.kevGoals + game.harGoals)

    const awayScore = document.getElementById('awayScore')
    awayScore.textContent = game.oppGoals

    const leadIcon = document.getElementById('leadIcon')
    leadIcon.classList.toggle('green', game.lead === 1)

    const overtimeIcon = document.getElementById('overtimeIcon')
    overtimeIcon.classList.toggle('green', game.overtime === 1)

    const maxLead = document.getElementById('maxLead')
    maxLead.textContent = game.maxLead

    const maxTrail = document.getElementById('maxTrail')
    maxTrail.textContent = game.maxTrail
}

function renderControls(game) {
    const gameStart = document.getElementById('gameStartButton')
    const gameEnd = document.getElementById('gameEndButton')
    const overtimeStart = document.getElementById('overtimeStartButton')
    const kevGoal = document.getElementById('kevGoalButton')
    const harGoal = document.getElementById('harGoalButton')
    const oppGoal = document.getElementById('oppGoalButton')

    const isTied = (game.kevGoals + game.harGoals === game.oppGoals)
    const canStartOvertime = isTied && game.active && !game.overtime
    const canEndGame = !isTied && game.active

    gameStart.toggleAttribute('disabled', game.active)
    gameEnd.toggleAttribute('disabled', !canEndGame)
    overtimeStart.toggleAttribute('disabled', !canStartOvertime)
    kevGoal.toggleAttribute('disabled', !game.active)
    harGoal.toggleAttribute('disabled', !game.active)
    oppGoal.toggleAttribute('disabled', !game.active)
}

function renderGameSection() {
    const events = pullCurrentGame()
    const game = buildCurrentGame(events)

    renderControls(game)
    renderCurrentGame(game)
}

function render() {
    renderEventsTable()
    renderGameSection()
    renderSessionSummary()
}


// Helper functions
function createCell(value) {
    const td = document.createElement('td')
    td.textContent = value

    return td
}

function createDeleteButtonCell(id) {
    const td = document.createElement('td')

    const button = document.createElement('button')
    button.textContent = 'Delete'
    button.classList.add('deleteButton')
    button.dataset.id = id

    td.append(button)

    return td
}

function pullCurrentGame() {
    const events = appState.events
    let lastStartIndex = -1

    for (let i = events.length - 1; i >= 0; i--) {
        if (events[i].type === 'gameStart') {
            lastStartIndex = i
            break
        }
    }

    if (lastStartIndex === -1) return [];

    return events.slice(lastStartIndex)
}

function buildCurrentGame(events) {
    const game = {
        date: new Date().toLocaleDateString(),
        lead: 0,
        kevGoals: 0,
        harGoals: 0,
        oppGoals: 0,
        overtime: 0,
        maxLead: 0,
        maxTrail: 0,
        active: false
    }

    for (const e of events) {
        if (e.type === 'gameStart') game.active = true;
        if (e.type === 'gameEnd') game.active = false;
        if (e.type === 'kevGoal') game.kevGoals++;
        if (e.type === 'harGoal') game.harGoals++;
        if (e.type === 'oppGoal') game.oppGoals++;
        if (e.type === 'overtimeStart') game.overtime = 1;

        const teamGoals = game.harGoals + game.kevGoals

        if (teamGoals > game.oppGoals) {
            if (game.overtime === 0) game.lead = 1;
            if (teamGoals - game.oppGoals > game.maxLead) game.maxLead = (teamGoals - game.oppGoals);
        }

        if (teamGoals < game.oppGoals) {
            if (game.oppGoals - teamGoals > game.maxTrail) game.maxTrail = (game.oppGoals - teamGoals);
        }

        if ((game.overtime === 0) & (game.harGoals + game.kevGoals) > game.oppGoals) game.lead = 1;
    }

    return game
}

function buildGames() {
    const games = [];

    let game = null;

    for (const e of appState.events) {

        if (e.type == 'gameStart') {
            game = {
                date: new Date().toLocaleDateString(),
                lead: 0,
                kevGoals: 0,
                harGoals: 0,
                oppGoals: 0,
                overtime: 0,
                maxLead: 0,
                maxTrail: 0,
                win: 0
            };
            continue;
        }

        if (!game) continue;

        if (e.type === 'kevGoal') game.kevGoals++;
        if (e.type === 'harGoal') game.harGoals++;
        if (e.type === 'oppGoal') game.oppGoals++;
        if (e.type === 'overtimeStart') game.overtime = 1;

        const teamGoals = game.harGoals + game.kevGoals;
        const margin = teamGoals - game.oppGoals;

        if (margin > 0) {
            if (game.overtime === 0) game.lead = 1;
            if (margin > game.maxLead) game.maxLead = margin;
        }

        if (margin < 0) {
            const trail = Math.abs(margin);
            if (trail > game.maxTrail) game.maxTrail = trail;
        }
    
        if (e.type == 'gameEnd') {
            if (margin > 0) game.win = 1;
            games.push(game);
            game = null;
        }
    
    }

    return games
}

async function copyGames() {
    const games = buildGames()

    let copyText = ''
    
    for (const game of games) {
        let rowText = ''
        
        rowText += game.date
        rowText += '\t'
        rowText += game.lead
        rowText += '\t'
        rowText += game.kevGoals
        rowText += '\t'
        rowText += game.harGoals
        rowText += '\t'
        rowText += game.oppGoals
        rowText += '\t'
        rowText += game.overtime
        rowText += '\n'

        copyText += rowText
    }

    

    await navigator.clipboard.writeText(copyText.trim());
}

async function copyEvents() {
    let copyText = ''
    
    for (const record of appState.events.toReversed()) {
        let rowText = ''

        rowText += record.timestamp
        rowText += '\t'
        rowText += record.type
        rowText += '\n'

        copyText += rowText
    }

    await navigator.clipboard.writeText(copyText.trim());
}

function showToast(message) {
    const toast = document.getElementById('toast')
    toast.textContent = message
    toast.classList.add('show')

    setTimeout(() => {
        toast.classList.remove('show')
    }, 1500)
}

// ========================================================



// Controller
function addEvent(type) {
    appState.events.push(
        {
            'id':crypto.randomUUID(),
            'type':type,
            'timestamp': new Date().toISOString()
        }
    )

    render()
}

function deleteEvent(id) {
    eventsNew = appState.events.filter((e) => e.id !== id)
    appState.events = eventsNew

    render()
}


// Add event listener, grabs the div containing them and listens to clicks inside
document.getElementById('controlsDiv').addEventListener('click', (e) => {
    if (e.target.matches('.controlButton')) {
        const type = e.target.dataset.type
        addEvent(type)
    }
})
// Delete event listener in events table, grabs tbody and listens to clicks inside
document.getElementById('eventsTable').querySelector('tbody').addEventListener('click', (e) => {
    if (e.target.matches('.deleteButton')) {
        const id = e.target.dataset.id

        if (!confirm('Delete this event?')) return
        deleteEvent(id)
    }
})
// Copy games listener for games table
document.getElementById('copyGamesButton').addEventListener('click', () => {
    copyGames()
    showToast('Copied to clipboard')
})
// Copy events listener for events table
document.getElementById('copyEventsButton').addEventListener('click', () => {
    copyEvents()
    showToast('Copied to clipboard')
})


render()
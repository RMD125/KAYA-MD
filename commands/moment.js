const moment = require('moment');
require('moment/locale/fr');
moment.locale('fr');

const { contextInfo } = require('../utils/contextInfo'); // import centralisé

module.exports = {
  name: 'calendrier',
  description: '📆 Affiche le calendrier avec la date du jour encadrée',

  run: async (kaya, m, msg, store, args) => {
    let year = moment().year();
    let month = moment().month(); // 0-indexed
    let highlightToday = true;

    if (args.length >= 2) {
      year = parseInt(args[0]);
      month = parseInt(args[1]) - 1;
      highlightToday = false;
    }

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return kaya.sendMessage(m.chat, {
        text: '❌ Format invalide. Utilise : `.calendrier [année] [mois]`\nExemple : `.calendrier 2025 7`',
        contextInfo
      }, { quoted: m });
    }

    const now = moment();
    const start = moment({ year, month, day: 1 });
    const daysInMonth = start.daysInMonth();
    const weekDays = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

    let calendar = `📅 *Calendrier de ${start.format('MMMM YYYY')}*\n`;
    calendar += weekDays.join('  ') + '\n';

    let line = '';
    let dayOfWeek = start.isoWeekday();

    for (let i = 1; i < dayOfWeek; i++) line += '    ';

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        highlightToday &&
        now.date() === day &&
        now.month() === month &&
        now.year() === year;

      let dayStr = (day < 10 ? ` ${day}` : `${day}`);
      dayStr = isToday ? `[${dayStr}]` : ` ${dayStr} `;
      line += dayStr;

      if ((dayOfWeek % 7) === 0) {
        calendar += line + '\n';
        line = '';
      } else {
        line += ' ';
      }
      dayOfWeek++;
    }

    if (line.trim() !== '') calendar += line + '\n';

    await kaya.sendMessage(m.chat, { text: calendar.trim(), contextInfo }, { quoted: m });
  }
};
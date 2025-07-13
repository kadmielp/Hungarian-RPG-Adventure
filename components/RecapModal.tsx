import React from 'react';
import { Mission, EncounteredWord } from '../types';

interface RecapModalProps {
  mission: Mission;
  encounteredWords: EncounteredWord[];
  onClose: () => void;
}

const RecapModal: React.FC<RecapModalProps> = ({ mission, encounteredWords, onClose }) => {
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Word,Root,RootMeaning,Suffix,SuffixMeaning,SuffixFunction,TimesEncountered\n";
    encounteredWords.forEach(item => {
        if(item.breakdown.suffixes.length > 0) {
            item.breakdown.suffixes.forEach(suffix => {
                const row = [item.word, item.breakdown.root.text, `"${item.breakdown.root.meaning}"`, suffix.text, `"${suffix.meaning}"`, `"${suffix.function}"`, item.count].join(",");
                csvContent += row + "\r\n";
            });
        } else {
             const row = [item.word, item.breakdown.root.text, `"${item.breakdown.root.meaning}"`, "N/A", "N/A", "N/A", item.count].join(",");
             csvContent += row + "\r\n";
        }
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hungarian_rpg_recap.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full border border-amber-300/50 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-3xl font-bold text-amber-300">Szép munka! (Great work!)</h2>
          <p className="text-slate-300 mt-1">You have completed the mission: "{mission.title}".</p>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto">
          <h3 className="text-xl font-bold text-amber-400 mb-4">Suffix Mastery Report</h3>
          {encounteredWords.length > 0 ? (
            <div className="space-y-4">
              {encounteredWords.map(({ word, breakdown, count }, index) => (
                <div key={index} className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="font-bold text-lg text-white">{word} <span className="text-sm text-slate-400 font-normal">(encountered {count}x)</span></p>
                  <div className="text-sm mt-2 pl-4 border-l-2 border-slate-600">
                    <p><span className="font-semibold text-sky-400">Root:</span> {breakdown.root.text} ({breakdown.root.meaning})</p>
                    {breakdown.suffixes.map((s, i) => (
                      <p key={i}><span className="font-semibold text-fuchsia-400">Suffix:</span> {s.text} - {s.function}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No new complex words were analyzed in this mission.</p>
          )}
        </div>

        <div className="p-6 border-t border-slate-700 flex flex-col sm:flex-row gap-4">
          <button
            onClick={exportToCSV}
            disabled={encounteredWords.length === 0}
            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            Export as CSV for Anki
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecapModal;
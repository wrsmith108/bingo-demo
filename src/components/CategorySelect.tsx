import { CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { Button } from './ui/Button';

interface Props {
  onSelect: (categoryId: CategoryId) => void;
  onBack: () => void;
}

export function CategorySelect({ onSelect, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Choose a Category</h2>
          <Button variant="ghost" onClick={onBack}>Back</Button>
        </div>

        <div className="grid gap-4">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg hover:scale-[1.02] transition-all duration-150"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
                  <p className="text-gray-500 text-sm">{category.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {category.words.slice(0, 6).map(word => (
                  <span
                    key={word}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
                  >
                    {word}
                  </span>
                ))}
                <span className="text-xs text-gray-400 px-2 py-0.5">
                  +{category.words.length - 6} more
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

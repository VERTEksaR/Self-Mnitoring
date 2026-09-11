import { TransactionModel, AddTransactionModel, EditTransactionModel } from '../TransactionModel.jsx';
import { CategoryModel, AddCategoryModel } from '../CategoryModel.jsx';
import { AccountModel, AddAccountModel } from '../AccountModel.jsx';
import { deleteTransaction } from '../../api/finance/transactions.ts';
import { deleteCategory } from '../../api/finance/categories.ts';
import { deleteAccount } from '../../api/finance/accounts.ts';

export function FinanceModals({
      selectedTransaction, setSelectedTransaction,
      addTransaction, setAddTransaction,
      editTransaction, setEditTransaction,
      selectedCategory, setSelectedCategory,
      addCategory, setAddCategory,
      selectedAccount, setSelectedAccount,
      addAccount, setAddAccount,
      categoriesMap, accountsMap,
      setAllTransactions, setCategories, setAccounts,
                              }) {
    return <>
        {selectedTransaction && (
                <TransactionModel transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    onDelete={async (id) => { await deleteTransaction(id); setAllTransactions(p => p.filter(t => t.id !== id)); setSelectedTransaction(null); }}
                    onEdit={(tx) => { setSelectedTransaction(null); setEditTransaction(tx); }}
                    categoriesMap={categoriesMap} accountsMap={accountsMap}
                />
            )}
            {addTransaction && (
                <AddTransactionModel onClose={() => setAddTransaction(null)}
                    onSaved={(tx) => setAllTransactions(p => [tx, ...p])} />
            )}
            {editTransaction && (
                <EditTransactionModel transaction={editTransaction}
                    onClose={() => setEditTransaction(null)}
                    onSaved={(u) => setAllTransactions(p => p.map(t => t.id === u.id ? u : t))} />
            )}
            {selectedCategory && (
                <CategoryModel category={selectedCategory}
                    onClose={() => setSelectedCategory(null)}
                    onDelete={async (id) => { await deleteCategory(id); setCategories(p => p.filter(c => c.id !== id)); setSelectedCategory(null); }}
                    onUpdate={(updated) => {
                        setCategories(p => p.map(c => c.id === updated.id ? updated : c));
                        setSelectedCategory(updated);
                    }}
                />
            )}
            {addCategory && (
                <AddCategoryModel onClose={() => setAddCategory(null)}
                    onSaved={(c) => setCategories(p => [c, ...p])} />
            )}
            {selectedAccount && (
                <AccountModel account={selectedAccount}
                    onClose={() => setSelectedAccount(null)}
                    onDelete={async (id) => { await deleteAccount(id); setAccounts(p => p.filter(a => a.id !== id)); setSelectedAccount(null); }}
                    onUpdate={(updated) => {
                        setAccounts(p => p.map(a => a.id === updated.id ? updated : a));
                        setSelectedAccount(updated);
                    }}
                />
            )}
            {addAccount && (
                <AddAccountModel onClose={() => setAddAccount(null)}
                    onSaved={(a) => setAccounts(p => [a, ...p])} />
            )}
    </>
}
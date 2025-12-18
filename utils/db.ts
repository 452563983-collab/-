import { CardTransaction } from '../types';

const DB_NAME = 'CardPortfolioDB';
const DB_VERSION = 1;
const STORE_NAME = 'cards';

// 初始化数据库
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Could not open database");
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// 获取所有卡牌
export const loadCardsFromDB = async (): Promise<CardTransaction[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // 按照 createdAt 倒序排列 (最新的在前)
      const data = request.result as CardTransaction[];
      data.sort((a, b) => b.createdAt - a.createdAt);
      resolve(data);
    };

    request.onerror = () => {
      reject("Error loading cards");
    };
  });
};

// 保存单个卡牌 (新增或更新)
export const saveCardToDB = async (card: CardTransaction): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(card);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error saving card");
  });
};

// 批量保存 (用于导入)
export const bulkSaveCardsToDB = async (cards: CardTransaction[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // 清空现有数据 (如果需要完全覆盖) 或 直接遍历添加
    // 这里采用清空后覆盖的策略，保证导入的数据与文件一致
    const clearRequest = store.clear();
    
    clearRequest.onsuccess = () => {
      let completed = 0;
      if (cards.length === 0) {
        resolve();
        return;
      }
      
      cards.forEach(card => {
        const req = store.put(card);
        req.onsuccess = () => {
          completed++;
          if (completed === cards.length) resolve();
        };
        req.onerror = () => reject("Error during bulk save");
      });
    };
    
    clearRequest.onerror = () => reject("Error clearing store");
  });
};

// 删除卡牌
export const deleteCardFromDB = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error deleting card");
  });
};

// 批量删除
export const bulkDeleteFromDB = async (ids: string[]): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      let completed = 0;
      if (ids.length === 0) {
          resolve();
          return;
      }

      ids.forEach(id => {
          const req = store.delete(id);
          req.onsuccess = () => {
              completed++;
              if (completed === ids.length) resolve();
          }
          req.onerror = () => reject("Error bulk deleting");
      });
    });
};
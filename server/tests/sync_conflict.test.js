const syncQueue = [];

describe('Offline-First & Conflict Handling Tests', () => {
  test('Queues mutations when offline and syncs successfully upon reconnection', async () => {
    let isOnline = false;
    const localDb = [];

    const syncManager = {
      saveBooking(booking) {
        if (!isOnline) {
          syncQueue.push({ type: 'CREATE_BOOKING', payload: booking, status: 'pending' });
          localDb.push({ ...booking, synced: false });
          return { offline: true, message: 'Saved locally. Queued for sync.' };
        } else {
          localDb.push({ ...booking, synced: true });
          return { offline: false, message: 'Saved and synced immediately.' };
        }
      },
      processQueue() {
        while (syncQueue.length > 0) {
          const item = syncQueue.shift();
          item.status = 'synced';
          const found = localDb.find(b => b.roomNumber === item.payload.roomNumber);
          if (found) found.synced = true;
        }
      }
    };

    // Act while offline
    const res1 = syncManager.saveBooking({ roomNumber: '101', nights: 3 });
    expect(res1.offline).toBe(true);
    expect(syncQueue.length).toBe(1);
    expect(localDb[0].synced).toBe(false);

    // Reconnect and trigger sync
    isOnline = true;
    syncManager.processQueue();
    expect(syncQueue.length).toBe(0);
    expect(localDb[0].synced).toBe(true);
  });

  test('Resolves update conflicts using Last-Write-Wins or server version priority', () => {
    const serverEntity = { id: 'room-1', pricePerNight: 200, version: 2, updatedAt: 1000 };
    const localEntity = { id: 'room-1', pricePerNight: 220, version: 1, updatedAt: 900 };

    const resolveConflict = (server, local) => {
      // Conflict resolution policy: Server version / timestamp wins or merges
      if (server.version > local.version || server.updatedAt > local.updatedAt) {
        return { resolved: server, source: 'server' };
      }
      return { resolved: local, source: 'local' };
    };

    const resolution = resolveConflict(serverEntity, localEntity);
    expect(resolution.source).toBe('server');
    expect(resolution.resolved.pricePerNight).toBe(200);
  });
});

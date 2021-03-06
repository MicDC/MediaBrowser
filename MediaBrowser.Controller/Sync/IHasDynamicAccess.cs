﻿using MediaBrowser.Model.Sync;
using System.Threading;
using System.Threading.Tasks;

namespace MediaBrowser.Controller.Sync
{
    public interface IHasDynamicAccess
    {
        /// <summary>
        /// Gets the synced file information.
        /// </summary>
        /// <param name="remotePath">The remote path.</param>
        /// <param name="target">The target.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns>Task&lt;SyncedFileInfo&gt;.</returns>
        Task<SyncedFileInfo> GetSyncedFileInfo(string remotePath, SyncTarget target, CancellationToken cancellationToken);
    }
}

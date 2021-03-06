﻿namespace MediaBrowser.Model.LiveTv
{
    public class TimerInfoDto : BaseTimerInfoDto
    {
        /// <summary>
        /// Gets or sets the status.
        /// </summary>
        /// <value>The status.</value>
        public RecordingStatus Status { get; set; }

        /// <summary>
        /// Gets or sets the series timer identifier.
        /// </summary>
        /// <value>The series timer identifier.</value>
        public string SeriesTimerId { get; set; }

        /// <summary>
        /// Gets or sets the external series timer identifier.
        /// </summary>
        /// <value>The external series timer identifier.</value>
        public string ExternalSeriesTimerId { get; set; }

        /// <summary>
        /// Gets or sets the run time ticks.
        /// </summary>
        /// <value>The run time ticks.</value>
        public long? RunTimeTicks { get; set; }

        /// <summary>
        /// Gets or sets the program information.
        /// </summary>
        /// <value>The program information.</value>
        public ProgramInfoDto ProgramInfo { get; set; }

    }
}

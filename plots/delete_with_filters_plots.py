import matplotlib.pyplot as plt
import numpy as np

# Data for the chart
users = [10000, 100000, 300000, 500000]
mysql_times = [89.7, 582.7, 2464.7, 4591.4]
mongodb_times = [27.3, 109.2, 305.4, 427.3]
elasticsearch_times = [66.0, 116.7, 174.2, 469.7]

# Bar width and positions
bar_width = 0.25
x = np.arange(len(users))

# Plot bars
bars_mysql = plt.bar(x - bar_width, mysql_times, width=bar_width, color='#00758f', label='MySQL')
bars_mongodb = plt.bar(x, mongodb_times, width=bar_width, color='#4DB33D', label='MongoDB')
bars_elasticsearch = plt.bar(x + bar_width, elasticsearch_times, width=bar_width, color='darkorange', label='Elasticsearch')

bar = bars_mysql[-1]
plt.text(bar.get_x() + bar.get_width() /2 , bar.get_height(), f'{bar.get_height()}', ha='center', va='bottom')

bar = bars_mongodb[-1]
plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height(), f'{bar.get_height()}', ha='right', va='bottom')

bar = bars_elasticsearch[-1]
plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height(), f'{bar.get_height()}', ha='center', va='bottom')


# Add labels, title, and legend
plt.xlabel('Number of users')
plt.ylabel('Milliseconds')
plt.title('Database Performance Comparison')
plt.xticks(x, users)
plt.legend(
    [bars_mysql[0], bars_mongodb[0], bars_elasticsearch[0]],
    ['MySQL', 'MongoDB (Winner)', 'Elasticsearch']
)

# Show the plot
plt.tight_layout()
plt.show()
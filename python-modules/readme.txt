Conda���ù��ھ���Դ

# ����Ĭ��Դ����������û���ӵľ���Դ·����ֻ����Ĭ�ϵ�·����
conda config --remove-key channels
vim ~/.condarc

.condarc�ĵ��������£��廪����Դ����

channels:
  - defaults
show_channel_urls: true
default_channels:
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
custom_channels:
  conda-forge: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  msys2: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  bioconda: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  menpo: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  pytorch: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  simpleitk: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud



�����ľ���Դ

# �пƴ���Դ
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/pkgs/main/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/pkgs/free/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/conda-forge/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/msys2/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/bioconda/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/menpo/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/

# ���ﾵ��Դ
conda config --add channels https://mirrors.aliyun.com/pypi/simple/

# �����python��Դ
conda config --add channels http://pypi.douban.com/simple/ 

# ��ʾ����·����ÿ�ΰ�װ��ʱ�Ὣ��Դ·����ʾ����
conda config --set show_channel_urls yes

conda config --set always_yes True

# ��ʾ���о���ͨ��·������
conda config --show channels

   

�ӹ��ھ���Դ���ذ�

# ���������Դ·������Ҫ��װ�İ�������
pip install -U pandas -i https://pypi.tuna.tsinghua.edu.cn/simple

pip install -U networkx python-louvain tensorflow-gpu==1.12 -i https://pypi.tuna.tsinghua.edu.cn/simple

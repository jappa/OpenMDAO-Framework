CDIAGT
      SUBROUTINE DIAGT(M)
C
      REAL MFSTOP
      LOGICAL PREVER
      COMMON /SNTCP/G,AJ,PRPC,ICASE,PREVER,MFSTOP,JUMP,LOPIN,ISCASE,
     1KN,GAMF,IP,SCRIT,PTRN,ISECT,KSTG,WTOL,RHOTOL,PRTOL,TRLOOP,LSTG,
     2LBRC,IBRC,ICHOKE,ISORR,CHOKE,PT0PS1(6,8),PTRS2(6,8),TRDIAG,SC,RC,
     3DELPR,PASS,IPC,LOPC,ISS
C
      COMMON /SINIT/H1(6,8),H2(6,8),DP0(6,8),DP1(6,8),DP1A(6,8),DP2(6,8)
     1,DP2A(6,8),CSALF1(6,8),ALF1(6,8),CSBET2(6,8),BET2(6,8),RADSD(6,8),
     2RADRD(6,8),ANN1(6,8),ANN2(6,8),ANN2A(6,8),ANN1A(6,8),U1A(6,8),
     3U2(6,8),ANN0(6,8),PT0(6,8),TT0(6,8),ALPHA0(6,8),PTP(6,8)
C
      COMMON /SINPUT/
     1PTPS,PTIN,TTIN,WAIR,FAIR,DELC,DELL,DELA,AACS,VCTD,STG,SECT,EXPN,
     2EXPP,EXPRE,RG,RPM,PAF,SLI,STGCH,ENDJOB,XNAME(20),TITLE(20),
     3PCNH(6),GAM(6,8),DR(6,8),DT(6,8),RWG(6,8),ALPHAS(6,8),ALPHA1(6,8),
     4ETARS(6,8),ETAS(6,8),CFS(6,8),ANDO(6,8),BETA1(6,8),BETA2(6,8),ETAR
     5R(6,8),ETAR(6,8),CFR(6,8),TFR(6,8),ANDOR(6,8),OMEGAS(6,8),AS0(6,8)
     6,ASMP0(6,8),ACMN0(6,8),A1(6,8),A2(6,8),A3(6,8),A4(6,8),A5(6,8),A6(
     76,8),OMEGAR(6,8),BSIA(6,8),BSMPIA(6,8),BCMNIA(6,8),B1(6,8),B2(6,8)
     8,B3(6,8),B4(6,8),B5(6,8),B6(6,8),SESTHI(8),RERTHI(8)
     9,fairx(5,8),wairx(5,8),rg1(8),rg1a(8),rg2(8),rg2a(8)
C
      REAL M0
      COMMON /SSTA01/CP0(8),w0(6),               PS0(6,8),V0(6,8),TS0(6,
     18),VU0(6,8),VZ0(6,8),RHOS0(6,8),PS1(6,8),WGT1(8),TA1(8),WG1(6,8),
     2            DPDR1(6,8),SI(6,8),  CP1(8),PHI1(6,8),TS1(6,8),V1(6,8)
     3,RHOS1(6,8),ALF1E(6,8),VU1(6,8),VZ1(6,8),M0(6,8)
C
      REAL MR1A
      COMMON /SSTA1A/VU1A(6,8),WG1A(6,8),WGT1A(8),VZ1A(6,8),  CP1A(8),
     1PS1A(6,8),RU1A(6,8),R1A(6,8),BET1A(6,8),RI(6,8),TTR1A(6,8),PTR1A(6
     2,8),MR1A(6,8)
C
      COMMON /SSTA2/V2(6,8),TTR2(6,8),PTR2(6,8),WG2(6,8),WGT2(8),TA2(8),
     1           PS2(6,8),PHI2(6,8)
C
      REAL MR2,M2     ,MF2
      COMMON /SFLOW2/TS2(6,8),CP2(8),R2(6,8),RHOS2(6,8),BET2E(6,8),RU2(6
     1,8),VU2(6,8),DPDR2(6,8),VZ2(6,8),MR2(6,8),MF2(6,8),M2(6,8)
C
      REAL M2A,MF2A
      COMMON /SSTA2A/WG2A(6,8),WGT2A(8),VU2A(6,8),VZ2A(6,8),PS2A(6,8),
     1ALF2A(6,8),TT2A(6,8),PT2A(6,8),TTBAR(8),PTBAR(8),STT0(8),SPT0(8),
     2M2A(6,8),MF2A(6,8),CP2A(8),V2A(6,8),TS2A(6,8),TAS(8),PAS(8),GAMS(8
     3),CPS(8),DELHVD(6,8)
C
      IF (M.EQ.0)  GO TO 10
      GO TO (10,19,11,12,13),M
10    DO 14 K=1,KN
      WRITE(16,1001)K,CP0(K),GAM(1,K)
1001  FORMAT(9X,1HK,I5,9X,3HCP0,F10.3,9X,5HGAMMA,F10.5)
      WRITE(16,1002) (PTP(I,K),I=1,ISECT)
1002  FORMAT(3X,6H   PTP,6F10.3)
      WRITE(16,1003) (PT0(I,K),I=1,ISECT)
1003  FORMAT(3X,6H   PT0,6F10.3)
      WRITE(16,1004) (PS0(I,K),I=1,ISECT)
1004  FORMAT(3X,6H   PS0,6F10.3)
      WRITE(16,1005) (TT0(I,K),I=1,ISECT)
1005  FORMAT(3X,6H   TT0,6F10.1)
      WRITE(16,1006) (TS0(I,K),I=1,ISECT)
1006  FORMAT(3X,6H   TS0,6F10.1)
      WRITE(16,1007) (V0(I,K),I=1,ISECT)
1007  FORMAT(3X,6H    V0,6F10.3)
      WRITE(16,1008) (ALPHA0(I,K),I=1,ISECT)
1008  FORMAT(3X,6HALPHA0,6F10.3)
14    WRITE(16,1009) (SI(I,K),I=1,ISECT)
      IF (M.EQ.0)  GO TO 19
      GO TO 18
19    DO 20 K=1,KN
1009  FORMAT(3X,6H    SI,6F10.3)
      WRITE(16,1010) K,CP1(K),GAM(2,K)
1010  FORMAT(9X,1HK,I5,9X,3HCP1,F10.3,9X,5HGAMMA,F10.5)
      WRITE(16,1011) (PS1(I,K),I=1,ISECT)
1011  FORMAT(3X,6H   PS1,6F10.3)
      WRITE(16,1012) (DPDR1(I,K),I=1,ISECT)
1012  FORMAT(3X,6H DPDR1,6F10.5)
      WRITE(16,1013) (TS1(I,K),I=1,ISECT)
1013  FORMAT (3X,6H   TS1,6F10.1)
      WRITE(16,1014) (WG1(I,K),I=1,ISECT)
1014  FORMAT(3X,6H   WG1,6F10.3)
      WRITE(16,1015) (V1(I,K),I=1,ISECT)
1015  FORMAT(3X,6H    V1,6F10.3)
      WRITE(16,1016) (ALF1E(I,K),I=1,ISECT)
1016  FORMAT (3X,6H ALF1E,6F10.3)
20    WRITE(16,1017) (ALF1(I,K),I=1,ISECT)
1017  FORMAT(3X,6H  ALF1,6F10.3)
      IF (M.EQ.0)  GO TO 11
      GO TO 18
11    DO 15 K=1,KN
      WRITE(16,1018) K,CP1A(K),GAM(3,K)
1018  FORMAT(9X,1HK,I5,9X,4HCP1A,F10.3,8X,5HGAMMA,F10.5)
      WRITE(16,1019) (PTR1A(I,K),I=1,ISECT)
1019  FORMAT(3X,6H PTR1A,6F10.3)
      WRITE(16,1020) (PS1A(I,K),I=1,ISECT)
1020  FORMAT(3X,6H  PS1A,6F10.3)
      WRITE(16,1021) (TTR1A(I,K),I=1,ISECT)
1021  FORMAT(3X,6H TTR1A,6F10.1)
      WRITE(16,1022) (WG1A(I,K),I=1,ISECT)
1022  FORMAT (3X,6H  WG1A,6F10.3)
      WRITE(16,1023) (R1A(I,K),I=1,ISECT)
1023  FORMAT (3X,6H   R1A,6F10.3)
      WRITE(16,1024) (BET1A(I,K),I=1,ISECT)
1024  FORMAT (3X,6H BET1A,6F10.3)
15    WRITE(16,1025) (RI(I,K),I=1,ISECT)
1025  FORMAT (3X,6H    RI,6F10.3)
      IF (M.EQ.0)  GO TO 12
      GO TO 18
12    DO 16 K=1,KN
      WRITE(16,1026)K,CP2(K),GAM(3,K)
1026  FORMAT(9X,1HK,I5,9X,3HCP2,F10.3,9X,5HGAMMA,F10.5)
      WRITE(16,1027) (PTR2(I,K),I=1,ISECT)
1027  FORMAT (3X,6H  PTR2,6F10.3)
      WRITE(16,1028) (PS2(I,K),I=1,ISECT)
1028  FORMAT (3X,6H   PS2,6F10.3)
      WRITE(16,1029) (DPDR2(I,K),I=1,ISECT)
1029  FORMAT (3X,6H DPDR2,6F10.5)
      WRITE(16,1030) (TTR2(I,K),I=1,ISECT)
1030  FORMAT (3X,6H  TTR2,6F10.1)
      WRITE(16,1031) (TS2(I,K),I=1,ISECT)
1031  FORMAT (3X,6H   TS2,6F10.1)
      WRITE(16,1032) (WG2(I,K),I=1,ISECT)
1032  FORMAT (3X,6H   WG2,6F10.3)
      WRITE(16,1033) (R2(I,K),I=1,ISECT)
1033  FORMAT (3X,6H    R2,6F10.3)
      WRITE(16,1034) (BET2E(I,K),I=1,ISECT)
1034  FORMAT (3X,6H BET2E,6F10.3)
16    WRITE(16,1035) (BET2(I,K),I=1,ISECT)
1035  FORMAT (3X,6H  BET2,6F10.3)
      IF (M.EQ.0)  GO TO 13
      GO TO 18
13    DO 17 K=1,KN
      L=K +1
      WRITE(16,1036)K,CP2A(K),GAM(5,K)
1036  FORMAT(9X,1HK,I5,9X,4HCP2A,F10.3,8X,5HGAMMA,F10.5)
      WRITE(16,1037) (PT2A(I,K),I=1,ISECT)
1037  FORMAT (3X,6H  PT2A,6F10.3)
      WRITE(16,1038) (PS2A(I,K),I=1,ISECT)
1038  FORMAT (3X,6H  PS2A,6F10.3)
      WRITE(16,1039) (TT2A(I,K),I=1,ISECT)
1039  FORMAT (3X,6H  TT2A,6F10.1)
      WRITE(16,1040) (TS2A(I,K),I=1,ISECT)
1040  FORMAT (3X,6H  TS2A,6F10.1)
      WRITE(16,1041) (WG2A(I,K),I=1,ISECT)
1041  FORMAT (3X,6H  WG2A,6F10.3)
      WRITE(16,1042) (V2A(I,K),I=1,ISECT)
1042  FORMAT (3X,6H   V2A,6F10.3)
      WRITE(16,1043) (ALF2A(I,K),I=1,ISECT)
1043  FORMAT (3X,6H ALF2A,6F10.3)
      WRITE(16,1044) (SI(I,K),I=1,ISECT)
1044  FORMAT (3X,6H    SI,6F10.3)
      WRITE(16,1045) L,CPS(K),GAMS(K)
1045  FORMAT(9X,1HL,I5,9X,3HCPS,F10.3,9X,5HGAMMA,F10.5)
      WRITE(16,1046) (PTP(I,L),I=1,ISECT)
1046  FORMAT (3X,6H   PTP,6F10.3)
      WRITE(16,1047) (PT0(I,L),I=1,ISECT)
1047  FORMAT (3X,6H   PT0,6F10.3)
17    WRITE(16,1048) (TT0(I,L),I=1,ISECT)
1048  FORMAT (3X,6H   TT0,6F10.1)
18    CONTINUE
      RETURN
      END
